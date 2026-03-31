#!/usr/bin/env python3
"""
Патч: об'єднати поле 'description' (з LBS Cloud) з 'note' для угод vinzart
Запуск: python3 patch_vinzart_notes.py

Логіка:
  - Якщо є description і є note  → note = note + "\n\n---\n" + description, видалити description
  - Якщо є description, нема note → note = description, видалити description
  - Якщо нема description         → пропустити
"""

import firebase_admin
from firebase_admin import credentials, firestore

COMPANY_ID = 'vinzart_mn8pnb4w'

# Ініціалізація
cred = credentials.Certificate('firebase_functions_backend/serviceAccount.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def main():
    ref = db.collection('companies').doc(COMPANY_ID)
    deals_ref = ref.collection('crm_deals')

    # Тільки імпортовані з LBS Cloud
    snap = deals_ref.where('importedFrom', '==', 'LBS Cloud').stream()
    deals = list(snap)
    print(f'Знайдено {len(deals)} угод з LBS Cloud')

    patched = 0
    skipped = 0

    for doc in deals:
        data = doc.to_dict()
        description = (data.get('description') or '').strip()
        note = (data.get('note') or '').strip()

        if not description:
            skipped += 1
            continue

        # Об'єднуємо
        if note:
            new_note = note + '\n\n---\n' + description
        else:
            new_note = description

        deals_ref.document(doc.id).update({
            'note': new_note,
            'description': firestore.DELETE_FIELD,
        })
        patched += 1
        print(f'  ✓ {doc.id} — {data.get("clientName", "?")} [{len(description)} chars]')

    print(f'\nГотово: {patched} оновлено, {skipped} пропущено (немає description)')

if __name__ == '__main__':
    main()
