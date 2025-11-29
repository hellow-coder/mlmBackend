const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
 
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
 
  attachments: [{
    url: String,
    publicId: String
  }],
  
  status: {
    type: String,
    enum: ['open', 'closed', 'pending'],
    default: 'open'
  }

}, {
  timestamps: true  
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;