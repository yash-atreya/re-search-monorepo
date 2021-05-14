const isNullOrUndefined = require('@nempet/is-null-or-undefined');

function checkProjectBody(req, res, next) {
    const {projectFormData, uid} = req.body;

    if(isNullOrUndefined(projectFormData, uid, projectFormData.name, projectFormData.cluster)) {
        res.status(400).json({
            error: true,
            message: 'Bad Request',
        }).end();
    }

    next();
}

module.exports = checkProjectBody;