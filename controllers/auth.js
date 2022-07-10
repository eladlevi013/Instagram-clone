export default (request,response,next) => {
    // If there is not user logged in, return to the login page
    if(!request.session.logged){
        return response.redirect('/');
    }
    next();
}