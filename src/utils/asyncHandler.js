//.resolve.catach use karke
const asyncHandler = (requestHandler)=>{
    return (req , res, next)=>{
        console.log("NEXT TYPE:", typeof next);
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export {asyncHandler}


//try catch use karke
// const asyncHandler = (fn) => async(req , res , next)=>{
//     try {
//         await fn(req , res , next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             sucess: false,
//             message: error.message
//         })
//     }
// }