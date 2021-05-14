export default async function handler(req, res) {
    const {uid} = req.query;
    console.log('UID in api ', uid);
    res.setPreviewData({
        uid,
    });
    // res.json({
    //     uid: uid,
    //     token: token,
    // })
    res.end();
}