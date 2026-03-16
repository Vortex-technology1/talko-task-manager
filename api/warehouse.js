'use strict';
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    ),
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { companyId, action } = req.query;
  if (!companyId) return res.status(400).json({ error: 'Missing companyId' });
  // Базова валідація — тільки alphanumeric + дефіс (Firestore doc ID формат)
  if (!/^[a-zA-Z0-9_-]{3,64}$/.test(companyId)) {
    return res.status(400).json({ error: 'Invalid companyId' });
  }

  const comp = db.collection('companies').doc(companyId);

  try {
    // ── GET: залишки з тривогами ─────────────────────────────
    if (req.method === 'GET' && action === 'alerts') {
      const stockSnap = await comp.collection('warehouse_stock').get();
      const alerts = [];
      stockSnap.forEach(doc => {
        const s = doc.data();
        if (s.minStock > 0 && s.qty <= s.minStock) {
          alerts.push({
            itemId: s.itemId,
            name: s.name,
            qty: s.qty,
            minStock: s.minStock,
            unit: s.unit || 'шт',
            level: s.qty === 0 ? 'critical' : s.qty <= s.minStock * 0.5 ? 'critical' : 'low',
          });
        }
      });
      return res.json({ alerts });
    }

    // ── POST: операція складу (IN / OUT / WRITE_OFF / ADJUST) ──
    if (req.method === 'POST' && action === 'operation') {
      const { itemId, type, qty, locationId, price, note, userId, dealId, batchId } = req.body;
      if (!itemId || !type || qty == null) {
        return res.status(400).json({ error: 'Missing itemId/type/qty' });
      }

      const itemRef  = comp.collection('warehouse_items').doc(itemId);
      const stockRef = comp.collection('warehouse_stock').doc(itemId);

      const result = await db.runTransaction(async tx => {
        const itemDoc  = await tx.get(itemRef);
        const stockDoc = await tx.get(stockRef);
        if (!itemDoc.exists) throw new Error('Item not found: ' + itemId);

        const item  = itemDoc.data();
        const stock = stockDoc.exists ? stockDoc.data() : { qty: 0, reserved: 0 };
        const prevQty = stock.qty || 0;
        let newQty = prevQty;

        if (type === 'IN')         newQty = prevQty + Number(qty);
        else if (type === 'OUT')   newQty = prevQty - Number(qty);
        else if (type === 'WRITE_OFF') newQty = prevQty - Number(qty);
        else if (type === 'ADJUST')    newQty = Number(qty);

        if (newQty < 0) throw new Error('Insufficient stock: ' + item.name);

        // Оновлюємо stock
        tx.set(stockRef, {
          itemId, qty: newQty,
          reserved: stock.reserved || 0,
          minStock: item.minStock || 0,
          name: item.name,
          unit: item.unit || 'шт',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        // Пишемо операцію
        const opRef = comp.collection('warehouse_operations').doc();
        tx.set(opRef, {
          itemId, itemName: item.name,
          type, qty: Number(qty),
          prevQty, newQty,
          locationId: locationId || 'main',
          price: price || item.costPrice || 0,
          note: note || '',
          dealId: dealId || null,
          batchId: batchId || null,
          userId: userId || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { newQty, opId: opRef.id, prevQty };
      });

      return res.json({ ok: true, ...result });
    }

    // ── POST: резервування для угоди ─────────────────────────
    if (req.method === 'POST' && action === 'reserve') {
      const { items, dealId, release } = req.body; // items: [{itemId, qty}]
      if (!items || !dealId) return res.status(400).json({ error: 'Missing items/dealId' });

      const results = [];
      for (const it of items) {
        const stockRef = comp.collection('warehouse_stock').doc(it.itemId);
        await db.runTransaction(async tx => {
          const doc = await tx.get(stockRef);
          const s = doc.exists ? doc.data() : { qty: 0, reserved: 0 };
          const delta = release ? -Number(it.qty) : Number(it.qty);
          const newReserved = Math.max(0, (s.reserved || 0) + delta);
          tx.set(stockRef, { reserved: newReserved, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
          results.push({ itemId: it.itemId, reserved: newReserved });
        });
      }
      return res.json({ ok: true, results });
    }

    // ── POST: списання при закритті угоди ───────────────────
    if (req.method === 'POST' && action === 'deal_won') {
      const { dealId, items, userId } = req.body; // items: [{itemId, qty, price}]
      if (!items || !dealId) return res.status(400).json({ error: 'Missing items/dealId' });

      const ops = [];
      for (const it of items) {
        const stockRef = comp.collection('warehouse_stock').doc(it.itemId);
        const itemRef  = comp.collection('warehouse_items').doc(it.itemId);

        const result = await db.runTransaction(async tx => {
          const [stockDoc, itemDoc] = await Promise.all([tx.get(stockRef), tx.get(itemRef)]);
          if (!itemDoc.exists) return null;
          const item  = itemDoc.data();
          const stock = stockDoc.exists ? stockDoc.data() : { qty: 0, reserved: 0 };
          const prevQty = stock.qty || 0;
          const newQty  = Math.max(0, prevQty - Number(it.qty));
          const newRes  = Math.max(0, (stock.reserved || 0) - Number(it.qty));

          tx.set(stockRef, {
            qty: newQty, reserved: newRes,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });

          const opRef = comp.collection('warehouse_operations').doc();
          tx.set(opRef, {
            itemId: it.itemId, itemName: item.name,
            type: 'OUT', qty: Number(it.qty),
            prevQty, newQty,
            locationId: 'main',
            price: it.price || item.costPrice || 0,
            note: 'Угода #' + dealId,
            dealId, userId: userId || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          return { itemId: it.itemId, newQty, opId: opRef.id };
        });
        if (result) ops.push(result);
      }

      // Знімаємо резерв
      return res.json({ ok: true, operations: ops });
    }

    return res.status(400).json({ error: 'Unknown action: ' + action });
  } catch (err) {
    console.error('[warehouse]', err.message);
    return res.status(500).json({ error: err.message });
  }
};
