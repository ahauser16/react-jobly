import React, { useContext, useState } from "react";
import "./JobCard.css";
import UserContext from "../auth/UserContext";

/** Show limited information about a job.
 *
 * Is rendered by JobCardList to show a "card" for each job.
 *
 * Receives apply func prop from parent, which is called on apply.
 *
 * JobCardList -> JobCard
 */

function JobCard({ id, title, salary, equity, companyName }) {
  console.debug("JobCard");
  //this `currentUser` variable was used below to check if the user has applied to a job, however, I was getting an error so I changed the function to async and added the `currentUser.username` parameter, however, the issue has not been resolved so I may change this back to the original code which means removing the code below (`const { currentUser, setCurrentUser } = useContext(UserContext);`). 
  const { currentUser, setCurrentUser } = useContext(UserContext);

  const { hasAppliedToJob, applyToJob } = useContext(UserContext);
  const [applied, setApplied] = useState();

  React.useEffect(
    function updateAppliedStatus() {
      console.debug("JobCard useEffect updateAppliedStatus", "id=", id);

      setApplied(hasAppliedToJob(id));
    },
    [id, hasAppliedToJob]
  );

  /** Apply for a job */
  async function handleApply(evt) {
    if (hasAppliedToJob(id)) return;
    // I was getting an error here, so I changed the function to async and added the `currentUser.username` parameter, however, he issue has not been resolved to I may change this back to the original code below (`applyToJob(id)`)
    // applyToJob(id);
    await applyToJob(currentUser.username, id);
    setApplied(true);
  }

  return (
    <div className="JobCard card">
      {" "}
      {applied}
      <div className="card-body">
        <h6 className="card-title">{title}</h6>
        <p>{companyName}</p>
        {salary && (
          <div>
            <small>Salary: {formatSalary(salary)}</small>
          </div>
        )}
        {equity !== undefined && (
          <div>
            <small>Equity: {equity}</small>
          </div>
        )}
        <button
          className="btn btn-danger fw-bold text-uppercase float-end"
          onClick={handleApply}
          disabled={applied}
        >
          {applied ? "Applied" : "Apply"}
        </button>
      </div>
    </div>
  );
}

/** Render integer salary like '$1,250,343' */

function formatSalary(salary) {
  const digitsRev = [];
  const salaryStr = salary.toString();

  for (let i = salaryStr.length - 1; i >= 0; i--) {
    digitsRev.push(salaryStr[i]);
    if (i > 0 && i % 3 === 0) digitsRev.push(",");
  }

  return digitsRev.reverse().join("");
}

export default JobCard;
