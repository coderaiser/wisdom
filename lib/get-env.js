export default (version) => {
    return Object.assign(process.env, {
        wisdom_version: version,
        WISDOM_VERSION: version,
    });
};

