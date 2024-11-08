export default (error, req, res, next) => {
  console.log(error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({ errorMessage: error.message });
  } else {
    return res
      .status(500)
      .json({ errorMessage: '서버에서 문제가 발생하였습니다.' });
  }
};
