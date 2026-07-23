import { IconChevronDown } from '@ui/shared/ui/icons';
import styles from './AboutPage.module.css';

const CONTACT_EMAIL = 'denisprof2@gmail.com';

const GITHUB_URL = 'https://github.com/denis-fateev/mocktail';
const PRIVACY_URL = 'https://denis-fateev.github.io/mocktail/privacy.html';
const LICENSES_URL = chrome.runtime.getURL('THIRD_PARTY_NOTICES.md');
const ICON_URL = chrome.runtime.getURL('mocktail_icon.png');
const VERSION = chrome.runtime.getManifest().version;

const FAQ_ITEMS = [
  {
    question: 'How does interception work?',
    answer: (
      <>
        <p>
          After you enable mocking on a tab, the extension attaches to it through the Chrome Debugger API and checks outgoing
          requests against your rules from top to bottom. By default only Fetch and XHR requests are saved and modified.
        </p>
        <p>Rules with an empty URL and disabled rules are skipped.</p>
        <p>For each request, matching enabled rules must satisfy both:</p>
        <ul>
          <li>
            <strong>URL</strong> — using the selected match type: Equals (exact match), Contains, Starts with, or Ends with;
          </li>
          <li>
            <strong>HTTP method</strong> — an exact match, or <strong>ANY</strong> for any method.
          </li>
        </ul>
        <p>
          Each rule has a <strong>Modify</strong> mode:
        </p>
        <ul>
          <li>
            <strong>Response</strong> (default) — the request is intercepted and the response is replaced with the rule&apos;s
            status code, body, headers, and delay;
          </li>
          <li>
            <strong>Request</strong> — the real response is kept; configured headers are merged into the outgoing request, and an
            optional delay is applied before the request is sent.
          </li>
        </ul>
        <p>
          Mocktail finds the first matching rule of each type. If a request matches both a request rule and a response rule, only
          the <strong>response</strong> rule applies — request headers are not added. Within one type, the topmost matching rule
          wins.
        </p>
        <p>If no rule matches, the request proceeds normally.</p>
      </>
    ),
  },
  {
    question: 'How does the extension use my data?',
    answer: (
      <>
        <p>
          Mocktail is{' '}
          <a className={styles.link} href={GITHUB_URL} target="_blank" rel="noreferrer">
            open source
          </a>{' '}
          — the full code is public, nothing is hidden.
        </p>
        <p>
          The extension <strong>does not intercept requests until you deliberately enable mocking</strong>.
        </p>
        <p>
          When mocking is enabled, network traffic is intercepted. The extension{' '}
          <strong>does not send captured data anywhere</strong>, but it may store data in your browser&apos;s local extension
          storage. It&apos;s a development tool —{' '}
          <strong>for maximum safety, do not use it on production accounts with real data.</strong>
        </p>
        <p>
          In Settings, you can disable Capture response bodies and headers to keep only the URL, method, and status for newly
          intercepted requests.
        </p>
        <p>
          Full policy:{' '}
          <a className={styles.link} href={PRIVACY_URL} target="_blank" rel="noreferrer">
            Privacy Policy
          </a>
          .
        </p>
      </>
    ),
  },
  {
    question: 'Found a bug, have an idea, or want to support the project?',
    answer: (
      <>
        Write to{' '}
        <a className={styles.link} href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        .
      </>
    ),
  },
];

export const AboutPage = () => (
  <div className={styles.page}>
    <section className={styles.intro}>
      <div className={styles.brandRow}>
        <img className={styles.brandIcon} src={ICON_URL} alt="" width={72} height={72} />
        <div className={styles.brandText}>
          <div className={styles.brandTitleRow}>
            <h1 className={styles.brandName}>Mocktail</h1>
            <span className={styles.version}>v{VERSION}</span>
          </div>
          <p className={styles.text}>
            Mocktail mocks API responses and modifies outgoing requests directly in the browser with per-tab activation.
          </p>
          <div className={styles.links}>
            <a className={styles.licensesLink} href={GITHUB_URL} target="_blank" rel="noreferrer">
              Source code
            </a>
            <a className={styles.licensesLink} href={PRIVACY_URL} target="_blank" rel="noreferrer">
              Privacy Policy
            </a>
            <a className={styles.licensesLink} href={LICENSES_URL} target="_blank" rel="noreferrer">
              Open source licenses
            </a>
          </div>
        </div>
      </div>
    </section>

    <section className={styles.faq}>
      <h2 className={styles.faqTitle}>Questions &amp; answers</h2>
      <ul className={styles.faqList}>
        {FAQ_ITEMS.map((item) => (
          <li key={item.question} className={styles.faqItem}>
            <details className={styles.faqDetails}>
              <summary className={styles.faqQuestion}>
                <span className={styles.faqQuestionText}>{item.question}</span>
                <IconChevronDown size={16} className={styles.faqChevron} />
              </summary>
              <div className={styles.faqAnswer}>{item.answer}</div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  </div>
);
