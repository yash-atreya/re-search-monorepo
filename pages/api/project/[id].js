export default async function handler(req, res) {
    const {uid, token} = req.query;

    console.log('req.query', req.query);

    res.setPreviewData({
        uid: uid,
        token: token,
    });
    res.json({
        uid: uid,
        token: token,
    })
    res.end();
}