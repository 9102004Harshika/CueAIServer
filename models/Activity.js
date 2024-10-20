import mongoose from "mongoose";
const ActivitySchema=mongoose.Schema({
    username:{
        type:String
    },
    activity:{
        type:String
    },
    date:{
        type: Date,
        default: Date.now,
    }
})
export const ActivityModel = mongoose.model('Activity', ActivitySchema);