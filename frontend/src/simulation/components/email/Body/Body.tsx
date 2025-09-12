import { useState, useEffect } from "react";
import css from "./Body.module.css";
import type { BodyProps } from "../../../../types/email";
import ResultsEmail from "../../ResultsEmail/ResultsEmail";
import FirstEmail from "../../FirstEmail/FirstEmail";

export default function Body({
  email,
  onClassifyEmail,
  userProgress,
  onStartTraining,
}: BodyProps) {
  const [emailContent, setEmailContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!email) {
      setEmailContent("");
      return;
    }

    // Special handling for results email (id="18")
    if (email.id === "18") {
      setEmailContent("");
      setLoading(false);
      return;
    }

    const loadEmailContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(email.contentPath);
        if (response.ok) {
          const content = await response.text();
          setEmailContent(content);
        } else {
          setEmailContent("<p>Помилка завантаження листа</p>");
        }
      } catch (error) {
        console.error("Error loading email content:", error);
        setEmailContent("<p>Помилка завантаження листа</p>");
      } finally {
        setLoading(false);
      }
    };

    loadEmailContent();
  }, [email]);

  if (!email) {
    return null;
  }

  // Special rendering for first email (welcome email)
  if (email.id === "1") {
    return (
      <div className={css.container}>
        <div className={css.top}>
          <div className={css.titleWrapper}>
            <img src={email.logoPath} alt={email.from} className={css.image} />
            <span className={css.title}>
              {email.from}
              <span className={css.arrow}> &gt;</span>
              <span className={css.fromEmail}> {email.fromEmail}</span>
            </span>
          </div>
        </div>
        <div className={css.content}>
          <FirstEmail onStartTraining={onStartTraining || (() => {})} />
        </div>
      </div>
    );
  }

  // Special rendering for results email
  if (email.id === "18") {
    return (
      <div className={css.container}>
        <div className={css.top}>
          <div className={css.titleWrapper}>
            <img src={email.logoPath} alt={email.from} className={css.image} />
            <span className={css.title}>
              {email.from}
              <span className={css.arrow}> &gt;</span>
              <span className={css.fromEmail}> {email.fromEmail}</span>
            </span>
          </div>
        </div>
        <div className={css.content}>
          {userProgress && <ResultsEmail userProgress={userProgress} />}
        </div>
      </div>
    );
  }

  // Перевіряємо чи можна класифікувати цей email (виключаємо перший та останній)
  const isClassifiable = email.id !== "1" && email.id !== "18";

  // Отримуємо поточну класифікацію якщо вона існує
  const currentClassification = userProgress?.classifiedEmails.find(
    (c) => c.emailId === email.id
  );

  const handlePhishingClick = () => {
    if (isClassifiable && onClassifyEmail) {
      onClassifyEmail(email.id, true);
    }
  };

  const handleSafeClick = () => {
    if (isClassifiable && onClassifyEmail) {
      onClassifyEmail(email.id, false);
    }
  };

  return (
    <div className={css.container}>
      <div className={css.top}>
        <div className={css.titleWrapper}>
          <img src={email.logoPath} alt={email.from} className={css.image} />
          <span className={css.title}>
            {email.from}
            <span className={css.arrow}> &gt;</span>
            <span className={css.fromEmail}> {email.fromEmail}</span>
          </span>
        </div>

        {isClassifiable && (
          <div className={css.actionBtns}>
            <button
              className={`${css.button} ${
                currentClassification?.isPhishingGuess === true
                  ? css.selected
                  : ""
              }`}
              onClick={handlePhishingClick}
              disabled={!!currentClassification}
            >
              <svg
                className={css.icon}
                viewBox="0 0 29 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.9131 1.6664C18.4711 1.6664 18.0471 1.84199 17.7346 2.15455C17.422 2.46711 17.2464 2.89104 17.2464 3.33307C17.2464 3.77509 17.422 4.19902 17.7346 4.51158C18.0471 4.82414 18.4711 4.99973 18.9131 4.99973C19.3551 4.99973 19.779 4.82414 20.0916 4.51158C20.4042 4.19902 20.5798 3.77509 20.5798 3.33307C20.5798 2.89104 20.4042 2.46711 20.0916 2.15455C19.779 1.84199 19.3551 1.6664 18.9131 1.6664ZM22.2464 3.33307C22.2465 4.07214 22.001 4.79029 21.5485 5.37462C21.0959 5.95894 20.462 6.3763 19.7464 6.56107V9.6664C19.7463 10.5216 20.0749 11.3442 20.6643 11.9639C21.2537 12.5837 22.0587 12.9532 22.9129 12.996C23.767 13.0388 24.605 12.7517 25.2534 12.194C25.9018 11.6363 26.311 10.8507 26.3964 9.99973H23.9131C23.7482 9.99976 23.5871 9.95091 23.45 9.85934C23.313 9.76777 23.2061 9.63761 23.143 9.48532C23.08 9.33303 23.0635 9.16545 23.0956 9.00378C23.1278 8.84211 23.2072 8.69361 23.3238 8.57706L26.6571 5.24373C26.7736 5.12716 26.9221 5.04776 27.0838 5.0156C27.2455 4.98343 27.4131 4.99993 27.5653 5.06302C27.7176 5.12611 27.8478 5.23294 27.9394 5.37001C28.0309 5.50708 28.0798 5.66822 28.0798 5.83307V9.6664C28.0798 10.9925 27.553 12.2643 26.6153 13.2019C25.6776 14.1396 24.4058 14.6664 23.0798 14.6664C21.7537 14.6664 20.4819 14.1396 19.5442 13.2019C18.6065 12.2643 18.0798 10.9925 18.0798 9.6664V6.56107C17.4761 6.40521 16.9283 6.0832 16.4985 5.63161C16.0687 5.18002 15.7742 4.61694 15.6484 4.00635C15.5225 3.39576 15.5705 2.76211 15.7867 2.17739C16.0029 1.59267 16.3788 1.08031 16.8716 0.698505C17.3645 0.316699 17.9545 0.0807533 18.5747 0.0174661C19.1949 -0.0458212 19.8204 0.0660872 20.3802 0.34048C20.94 0.614873 21.4116 1.04075 21.7415 1.56975C22.0714 2.09874 22.2463 2.70964 22.2464 3.33307ZM14.2931 2.6664H4.57975C3.47468 2.6664 2.41488 3.10539 1.63347 3.88679C0.852073 4.66819 0.413086 5.728 0.413086 6.83307V19.8331C0.413086 20.9381 0.852073 21.9979 1.63347 22.7793C2.41488 23.5607 3.47468 23.9997 4.57975 23.9997H22.9131C24.0182 23.9997 25.078 23.5607 25.8594 22.7793C26.6408 21.9979 27.0798 20.9381 27.0798 19.8331V14.5771C26.5775 14.9866 26.0154 15.3167 25.4131 15.5557V19.8331C25.4131 20.4961 25.1497 21.132 24.6809 21.6008C24.212 22.0697 23.5761 22.3331 22.9131 22.3331H4.57975C3.91671 22.3331 3.28083 22.0697 2.81199 21.6008C2.34314 21.132 2.07975 20.4961 2.07975 19.8331V9.2624L13.3558 15.2451C13.4756 15.3087 13.6092 15.342 13.7449 15.3423C13.8806 15.3425 14.0143 15.3096 14.1344 15.2464L17.8758 13.2771C17.5574 12.8188 17.3009 12.3205 17.1131 11.7951L13.7478 13.5664L2.07975 7.37506V6.83307C2.07975 6.17002 2.34314 5.53414 2.81199 5.0653C3.28083 4.59646 3.91671 4.33307 4.57975 4.33307H14.3538C14.2338 3.78562 14.2128 3.22105 14.2931 2.6664Z"
                  fill="#040270"
                />
              </svg>
              Фішинг
              {currentClassification &&
                currentClassification.isPhishingGuess === true && (
                  <span className={css.feedback}>
                    {currentClassification.isCorrect ? "✓" : "✗"}
                  </span>
                )}
            </button>

            <button
              className={`${css.button} ${
                currentClassification?.isPhishingGuess === false
                  ? css.selected
                  : ""
              }`}
              onClick={handleSafeClick}
              disabled={!!currentClassification}
            >
              <svg
                className={css.icon}
                viewBox="0 0 26 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.9502 20.25V14.1C23.4933 13.827 24.0046 13.4966 24.4749 13.1145V20.25C24.4749 21.2446 24.0733 22.1984 23.3584 22.9016C22.6436 23.6049 21.6741 24 20.6631 24H3.89135C2.88041 24 1.91087 23.6049 1.19603 22.9016C0.481185 22.1984 0.0795898 21.2446 0.0795898 20.25V8.25C0.0795898 7.25544 0.481185 6.30161 1.19603 5.59835C1.91087 4.89509 2.88041 4.5 3.89135 4.5H11.0681C10.9272 4.99036 10.8328 5.4925 10.7861 6H3.89135C3.28479 6 2.70307 6.23705 2.27416 6.65901C1.84525 7.08097 1.6043 7.65326 1.6043 8.25V8.703L12.2772 14.88L14.4743 13.608C14.9704 13.935 15.5005 14.2085 16.0646 14.4285L12.6645 16.3965C12.5673 16.4527 12.4586 16.4869 12.3463 16.4968C12.2339 16.5066 12.1208 16.4918 12.015 16.4535L11.89 16.3965L1.6043 10.4445V20.25C1.6043 20.8467 1.84525 21.419 2.27416 21.841C2.70307 22.2629 3.28479 22.5 3.89135 22.5H20.6631C21.2697 22.5 21.8514 22.2629 22.2803 21.841C22.7092 21.419 22.9502 20.8467 22.9502 20.25ZM19.1384 13.5C20.9581 13.5 22.7033 12.7888 23.99 11.523C25.2767 10.2571 25.9996 8.54021 25.9996 6.75C25.9996 4.95979 25.2767 3.2429 23.99 1.97703C22.7033 0.711159 20.9581 0 19.1384 0C17.3187 0 15.5736 0.711159 14.2868 1.97703C13.0001 3.2429 12.2772 4.95979 12.2772 6.75C12.2772 8.54021 13.0001 10.2571 14.2868 11.523C15.5736 12.7888 17.3187 13.5 19.1384 13.5ZM22.7276 5.031L18.1535 9.531C18.0826 9.60085 17.9985 9.65626 17.9059 9.69407C17.8133 9.73188 17.714 9.75134 17.6137 9.75134C17.5134 9.75134 17.4141 9.73188 17.3215 9.69407C17.2289 9.65626 17.1448 9.60085 17.074 9.531L15.5493 8.031C15.4061 7.89017 15.3257 7.69916 15.3257 7.5C15.3257 7.30084 15.4061 7.10983 15.5493 6.969C15.6924 6.82817 15.8866 6.74905 16.089 6.74905C16.2914 6.74905 16.4856 6.82817 16.6287 6.969L17.6137 7.9395L21.6481 3.969C21.7912 3.82817 21.9854 3.74905 22.1878 3.74905C22.3903 3.74905 22.5844 3.82817 22.7276 3.969C22.8707 4.10983 22.9511 4.30084 22.9511 4.5C22.9511 4.69916 22.8707 4.89017 22.7276 5.031Z"
                  fill="#040270"
                />
              </svg>
              Безпечний
              {currentClassification &&
                currentClassification.isPhishingGuess === false && (
                  <span className={css.feedback}>
                    {currentClassification.isCorrect ? "✓" : "✗"}
                  </span>
                )}
            </button>
          </div>
        )}
      </div>

      <div className={css.content}>
        {loading ? (
          <p>Завантаження листа...</p>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: emailContent }} />
        )}
      </div>
    </div>
  );
}
