/**
 * Calculates the exponential cdf.
 *
 * @param {number} x The value.
 * @returns {number} The exponential cdf.
 */

/**
 * Calculates the log normal cdf.
 *
 * @param {number} x The value.
 * @returns {number} The log normal cdf.
 */
function log_normal_cdf(x) {
  // approximation
  return x / (1 + x);
}

/**
 * Calculates the users rank.
 *
 * @param {object} params Parameters on which the user's rank depends.
 * @param {boolean} params.all_commits Whether `include_all_commits` was used.
 * @param {number} params.commits Number of commits.
 * @param {number} params.prs The number of pull requests.
 * @param {number} params.issues The number of issues.
 * @param {number} params.reviews The number of reviews.
 * @param {number} params.repos Total number of repos.
 * @param {number} params.stars The number of stars.
 * @param {number} params.followers The number of followers.
 * @returns {{ level: string, percentile: number }} The users rank.
 */
function exponential_cdf(x) {
  return 1 - 2 ** -x;
}

function calculateRank({
  all_commits,
  commits,
  prs,
  issues,
  reviews,
  repos, // unused
  stars,
  followers,
}) {
  const COMMITS_MEDIAN = all_commits ? 1000 : 250;
  const PRS_MEDIAN = 50;
  const ISSUES_MEDIAN = 25;
  const REVIEWS_MEDIAN = 10;   // was 2 (too tiny -> most people saturate instantly)
  const STARS_MEDIAN = 200;    // was 50 (too harsh for non-OSS folks)
  const FOLLOWERS_MEDIAN = 50; // was 10

  const COMMITS_WEIGHT = 2;
  const PRS_WEIGHT = 3;
  const ISSUES_WEIGHT = 1;
  const REVIEWS_WEIGHT = 1;
  const STARS_WEIGHT = 1;      // ↓ neutralize popularity
  const FOLLOWERS_WEIGHT = 0.5; // ↓

  const TOTAL_WEIGHT =
    COMMITS_WEIGHT +
    PRS_WEIGHT +
    ISSUES_WEIGHT +
    REVIEWS_WEIGHT +
    STARS_WEIGHT +
    FOLLOWERS_WEIGHT;

  const THRESHOLDS = [1, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];
  const LEVELS = ["S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C"];

  const score =
    (COMMITS_WEIGHT * exponential_cdf(commits / COMMITS_MEDIAN) +
      PRS_WEIGHT * exponential_cdf(prs / PRS_MEDIAN) +
      ISSUES_WEIGHT * exponential_cdf(issues / ISSUES_MEDIAN) +
      REVIEWS_WEIGHT * exponential_cdf(reviews / REVIEWS_MEDIAN) +
      STARS_WEIGHT * exponential_cdf(stars / STARS_MEDIAN) +
      FOLLOWERS_WEIGHT * exponential_cdf(followers / FOLLOWERS_MEDIAN)) /
    TOTAL_WEIGHT;

  const rank = 1 - score; // keep existing meaning

  const level = LEVELS[THRESHOLDS.findIndex((t) => rank * 100 <= t)];
  return { level, percentile: rank * 100 };
}

export { calculateRank };
export default calculateRank;
