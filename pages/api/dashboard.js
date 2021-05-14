export default async function handler(req, res) {
    console.log('Calling Dashboard API...')
    const {uid, token} = req.query;

    console.log('req.query', req.query);

    // res.setPreviewData({
    //     uid: uid,
    //     token: token,
    // });
    res.json({
        uid: uid ? uid : null,
        token: token ? uid : null,
    })
    res.end();
}