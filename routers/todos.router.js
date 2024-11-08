// Router는 express 속의 기능이니까!
import express from "express";
import Todo from "../schemas/todo.schemas.js";
import Joi from "joi";

const router = express.Router();

/**
1. `value` 데이터는 **필수적으로 존재**해야한다.
2. `value` 데이터는 **문자열 타입**이어야한다.
3. `value` 데이터는 **최소 1글자 이상**이어야한다.
4. `value` 데이터는 **최대 50글자 이하**여야한다.
5. 유효성 검사에 실패했을 때, 에러가 발생해야한다.
*/

const createdTodoSchema = Joi.object({
  value: Joi.string().min(1).max(50).required(),
});

/** 할 일 등록 API */
router.post("/todos", async (req, res, next) => {
  try {
    // // 1. 입력 받은 value를 찾는다.
    // const { value } = req.body;

    // req.body로 받은 값을 먼저 joi로 검사하고
    const validation = await createdTodoSchema.validateAsync(req.body);

    // 통과된 데이터만 value에 넣는다.
    const { value } = validation;

    // 1-5. 만약, 클라이언트가 value 데이터를 입력하지 않았을 경우!
    if (!value) {
      return res
        .status(400)
        .json({ errorMessage: "value 데이터가 존재하지 않습니다." });
    }

    // 2. DB에 저장된 Order를 조회한다.
    // findOne = 1개의 데이터를 조회할거다.
    // sort = 정렬한다. -> 어떤 컬럼을? order란 컬럼을 정렬한다. "-"는 내림차순
    const todoMaxOrder = await Todo.findOne().sort("-order").exec();

    // 3. Order가 존재한다면 현재 해야할 일을 +1하고 order 데이터가 존재하지 않다면 1로 할당한다.
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    // 4. 해야 할 일을 등록한다.
    const todo = new Todo({ value, order });
    await todo.save();

    // 5. 해야 할 일을 클라이언트에게 반환한다.
    return res.status(201).json({ todo: todo });
  } catch (error) {
    // Router 다음에 있는 에러 처리 미들웨어를 실행한다.
    // 즉 에러가 발생했다. 그러면 밑으로 내려가는데 next네?
    // next는 누구를 부르지? error를 부르네? error은 어디에 있지?
    // 아~ 에러처리 미들웨어를 부르는구만 거기로 ㄱㄱ싱!
    next(error);
  }
});

/** 해야 할 일 목록 조회 API */
router.get("/todos", async (req, res) => {
  // 1. 해야 할 일 목록 조회를 진행한다.
  const todos = await Todo.find().sort("-order").exec();

  // 2. 해야할 일 목록 조회 결과를 클라이언트에게 반환한다.
  return res.status(200).json({ todos });
});

/** 할 일 순서,내용 변경, 완료 / 해제 API 만들기 */
router.patch("/todos/:todoId", async (req, res) => {
  // 1. 수정할 목록 찾기
  const { todoId } = req.params;
  const { order, done, value } = req.body;

  // 2. 수정할 목록이 DB에 있는지 검색하기
  const currentTodo = await Todo.findById(todoId).exec();

  // 2-1. 없다면 오류 뱉기
  if (!currentTodo) {
    return res
      .status(404)
      .json({ errorMessage: "찾으시는 할 일 목록이 없습니다." });
  }

  // 해야 할 일 순서 변경하기
  // 3. 변경하려는 order 값을가지고 있는 해야할 일을 찾는다.

  // 만약 req.body에 "order"가 존재하는 경우
  if (order) {
    // 바꾸려고 하는 order 값을 가진 todo를 찾는다. 여기서는 "targetTodo"
    const targetTodo = await Todo.findOne({ order: order }).exec();

    // 해당 '해야할 일'의 order 값을 변경하고 저장합니다.
    if (targetTodo) {
      // 기존 targetTodo의 order 값을 내가 바꾸고 싶어하는 녀석의 order값으로 덮어쓰기 한다. ex 8 -> 5번
      targetTodo.order = currentTodo.order;
      // 8번에서 5번으로 바뀌었으니 저장한다.
      await targetTodo.save();
    }

    // id를 통해서 검색했던 녀석의 order값을 req.body로 입력한 order 값으로 덮어쓰기한다.
    currentTodo.order = order;
  }

  if (value) {
    currentTodo.value = value;
  }

  if (done !== undefined) {
    // 참이면 new Date / 거짓이면 null
    currentTodo.doneAt = done ? new Date() : null;
  }

  await currentTodo.save();

  return res.status(200).json({ message: "성공적으로 변경되었습니다." });
});

/** 할 일 삭제 API */
router.delete("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;

  const foundTodoId = await Todo.findById(todoId).exec();

  if (!foundTodoId) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 할 일 입니다." });
  }

  await Todo.deleteOne({ _id: todoId }).exec();

  return res.status(200).json({ message: "성공적으로 삭제하였습니다." });
});

export default router;
