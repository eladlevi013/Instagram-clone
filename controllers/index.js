// import
import express from 'express';
const router = express.Router();

// renders the login page, and pass the error as a parameter if there's any error
router.get('/', async(request,response) => {
    var signin_error = request.query.error;
    if(signin_error != null) {
        response.render('index', {error: signin_error});
    }
    else 
        response.render('index', {error: 'none'});
})

export default router;