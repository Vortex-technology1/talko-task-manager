// BUSINESS STRUCTURE - Module 65 (iframe)

function showBizStructureTab() {
    var c = document.getElementById("bizstructureTab");
    if (!c) return;
    var f = document.getElementById("bizIframe");
    if (!f) {
        f = document.createElement("iframe");
        f.id = "bizIframe";
        f.src = "biz-structure.html";
        f.style.width = "100%";
        f.style.height = "calc(100vh - 180px)";
        f.style.border = "none";
        c.innerHTML = "";
        c.appendChild(f);
        window.addEventListener("message", function(e) {
            if (e.data && e.data.type === "biz-auth-request" && f.contentWindow) {
                f.contentWindow.postMessage({type:"biz-auth",companyId:window.currentCompany}, "*");
            }
        });
    }
    setTimeout(function() {
        if (f && f.contentWindow) f.contentWindow.postMessage({type:"biz-auth",companyId:window.currentCompany}, "*");
    }, 500);
}
function hideBizStructureTab() {}
