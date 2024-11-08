import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema({
  value: {
    type: String,
    require: true,
  },
  order: {
    type: Number,
    require: true,
  },
  doneAt: {
    type: Date,
    require: false, // 왜? null 값을 넣어야 하기 때문에!
  },
});

// 프론트엔드 서빙을 위한 코드입니다. 모르셔도 괜찮아요!
TodoSchema.virtual('todoId').get(function () {
  return this._id.toHexString();
});
TodoSchema.set('toJSON', {
  virtuals: true,
});

export default mongoose.model('TodoSchema', TodoSchema);
