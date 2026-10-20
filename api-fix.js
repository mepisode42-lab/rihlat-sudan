import pathlib
p=pathlib.Path("index.js")
t=p.read_text(encoding="utf-8", errors="ignore")
if "module.exports" not in t:
    # اضيف في النهاية
    t+= "\n\n// Fix for Vercel\nmodule.exports = app;\n"
    if "app.listen" in t:
        t=t.replace("app.listen", "if (!process.env.VERCEL) app.listen")
    p.write_text(t, encoding="utf-8")
    print("fixed index.js")
else:
    print("already has module.exports")
