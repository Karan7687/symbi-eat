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
        },
        async  index(req,res){

                //fetch orders of logged in  used from DB
                const orders= await Order.find({customerId:req.user._id});
            // console.log(orders); 
            // we get the orders, now render it on some customers/order.ejs page to see orders list
            
            res.render("customers/orders",{orders:orders})
                

        }


    };
}

module.exports=orderController;