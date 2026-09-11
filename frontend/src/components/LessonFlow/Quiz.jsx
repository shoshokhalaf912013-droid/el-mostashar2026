import PropTypes from "prop-types";

export default function Quiz({ quizId }) {
  if (!quizId) return null;

  return (
    <div className="quiz-wrapper">
      <h3>اختبار الدرس</h3>
      {/* هنا لاحقًا منطق الكويز */}
      <p>Quiz ID: {quizId}</p>
    </div>
  );
}

Quiz.propTypes = {
  quizId: PropTypes.string,
};
