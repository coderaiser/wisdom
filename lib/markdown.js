export function markdown(str) {
    return str
        .replace(/\bfix\b:/g, '## 🐞 fix\n')
        .replace(/\bfeature\b:/g, '## 🔥 feature\n');
}
