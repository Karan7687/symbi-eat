function guest(req,res,next){

    if(!req.isAuthenticated()){

        return next()
    }

    // Redirect authenticated users to their appropriate dashboard
    if(req.user.role === 'admin'){
        return res.redirect('/admin/dashboard')
    } else {
        return res.redirect('/menu')
    }

}

module.exports=guest;