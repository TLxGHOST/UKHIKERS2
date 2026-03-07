import TrekSlot from "../models/TrekSlot.js";

/* CREATE SLOT */

export const createSlot = async (req,res)=>{

try{

const { trekId,date,totalSeats } = req.body;

const slot = await TrekSlot.create({
trekId,
date,
totalSeats
});

res.json({
success:true,
slot
});

}catch(err){

console.error(err);

res.status(500).json({
message:"Slot creation failed"
});

}

};

/* GET ALL SLOTS */

export const getSlots = async(req,res)=>{

try{

const slots = await TrekSlot
.find()
.populate("trekId","title");

res.json(slots);

}catch(err){

res.status(500).json({
message:"Failed to fetch slots"
});

}

};

/* GET SLOTS BY TREK */

export const getSlotsByTrek = async(req,res)=>{

try{

const { trekId } = req.params;

const slots = await TrekSlot.find({ trekId });

res.json(slots);

}catch(err){

res.status(500).json({
message:"Failed to fetch slots"
});

}

};

/* DELETE SLOT */

export const deleteSlot = async(req,res)=>{

try{

const { id } = req.params;

await TrekSlot.findByIdAndDelete(id);

res.json({ success:true });

}catch(err){

res.status(500).json({
message:"Delete failed"
});

}

};