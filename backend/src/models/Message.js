import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índice para búsqueda eficiente de conversaciones
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, read: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
