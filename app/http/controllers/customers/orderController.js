const Order= require("../../../models/order")
function orderController(){

    return {

        store(req,res){

            // console.log(body)
            //validate the request

                const order=new Order({
                    customerId:req.user._id,
                    items:req.session.cart.items,

                })

                order.save().then(result=>{
                    req.flash("Success", "Order Placed Successfully !")
                    res.redirect("/")

                }).catch(err=>{

                    req.flash("error","Something went wrong !")

                    return res.redirect("/cart");
                })
        }
    };
}

module.exports=orderController;