const mongoose = require('mongoose');

const plannerSlotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weekStartDate: {
    type: Date,
    required: true,
  },
  dayIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 6,
  },
  slot: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  customNote: {
    type: String,
  },
  timeFrom: {
    type: String,
  },
  timeTo: {
    type: String,
  }
}, {
  timestamps: true
});

plannerSlotSchema.index({ userId: 1, weekStartDate: 1 });

const PlannerSlot = mongoose.model('PlannerSlot', plannerSlotSchema);
module.exports = PlannerSlot;
