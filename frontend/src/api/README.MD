# api.js notes
## [TABLE OF CONTENTS](#table-of-contents)

## Code Breakdown
### `BASE_URL`
`const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3001";`
- This is the base URL of the API server.
- `process.env.REACT_APP_BASE_URL` allows you to specify the API URL in an environment file (e.g., `.env`).
- If the environment variable isn’t set, it defaults to `http://localhost:3001`.
[back to TOC](#table-of-contents)

### `JoblyApi` Class
```javascript
class JoblyApi {
  static token;
```

- A static class means you don’t need to create an instance of it (`new JoblyApi()`).
- It centralizes all communication with the backend server.
- It has a static variable token to store the JWT token used for authenticated requests.
[back to TOC](#table-of-contents)

### `request` method
```javascript
static async request(endpoint, data = {}, method = "get") {
  console.debug("API Call:", endpoint, data, method);

  const url = `${BASE_URL}/${endpoint}`;
  const headers = { Authorization: `Bearer ${JoblyApi.token}` };
  const params = method === "get" ? data : {};

  try {
    return (await axios({ url, method, data, params, headers })).data;
  } catch (err) {
    console.error("API Error:", err.response);
    let message = err.response.data.error.message;
    throw Array.isArray(message) ? message : [message];
  }
}
```

**What it does:**
- It’s a helper function that simplifies making API requests.
- Parameters:
    - endpoint: The specific API route to call (e.g., `auth/token`).
    - data: Any data sent to the API (e.g., form data or query parameters).
    - method: HTTP method (`get`, `post`, `patch`, etc.).
**Authorization:**
- Adds a header with the JWT token for authenticated requests:
```javascript
Authorization: `Bearer ${JoblyApi.token}`;`
```

**Error Handling:**
- If the API returns an error, it throws a readable error message.

### API Methods (Endpoints)
The JoblyApi class provides several static methods, each corresponding to an API endpoint. These methods call request to interact with the server.

[back to TOC](#table-of-contents)

### User Authentication
- `login`

```javascript
static async login(data) {
  let res = await this.request(`auth/token`, data, "post");
  return res.token;
}
```

- Sends `username` and `password` to `/auth/token`.

- Returns a JWT token upon successful login.

- `signup`

```javascript
static async signup(data) {
  let res = await this.request(`auth/register`, data, "post");
  return res.token;
}
```

- Sends user registration data to `/auth/register` to create a new account.
- Returns a JWT token.
[back to TOC](#table-of-contents)

### User Management
- `getCurrentUser`
```javascript
static async getCurrentUser(username) {
  let res = await this.request(`users/${username}`);
  return res.user;
}
```
- Fetches user details for a specific username.

- `saveProfile`

```javascript
static async saveProfile(username, data) {
  let res = await this.request(`users/${username}`, data, "patch");
  return res.user;
}
```
- Updates user profile information (e.g., name, email, etc.) using a `PATCH` request.
[back to TOC](#table-of-contents)

### Job Management
- `getJobs`
```javascript
static async getJobs(title) {
  let res = await this.request("jobs", { title });
  return res.jobs;
}
```
- Fetches a list of jobs.

- Optional: Filters jobs by title.

- `applyToJob`

```javascript
static async applyToJob(username, id) {
  await this.request(`users/${username}/jobs/${id}`, {}, "post");
}
```
- Allows a user to apply to a job by sending a `POST` request.

### Company Management
- `getCompanies`
```javascript
static async getCompanies(nameLike) {
  let res = await this.request("companies", { nameLike });
  return res.companies;
}
```
- Fetches a list of companies.

- Optional: Filters companies by a partial name.

- `getCompany`

```javascript
static async getCompany(handle) {
  let res = await this.request(`companies/${handle}`);
  return res.company;
}
```

- Fetches details of a single company using its handle (a unique identifier).
[back to TOC](#table-of-contents)

## How This Works in a React App
### Authentication:
- User logs in using `login` or signs up using `signup`.
- The JWT token returned by the server is stored in `JoblyApi.token` for subsequent authenticated requests.

### Fetching Data:
- Components call methods like `getJobs`, `getCompanies`, or `getCurrentUser` to fetch data from the backend server.
[back to TOC](#table-of-contents)

### Updating Data:
- `saveProfile` allows updating user information.
- `applyToJob` lets users apply to jobs.
[back to TOC](#table-of-contents)

## Why This Structure Is Useful
### Separation of Concerns:
- All API-related logic is centralized in `api.js`. The React components don’t worry about constructing HTTP requests.
[back to TOC](#table-of-contents)

### Reusable and Clean:
- You can call these methods (JoblyApi.getJobs(), JoblyApi.login()) anywhere in your app, which makes the code cleaner.
[back to TOC](#table-of-contents)

### Error Handling:
- Errors returned by the server are caught and handled gracefully.
[back to TOC](#table-of-contents)

### Authorization:
- JWT tokens are used for secure, authenticated API requests.
[back to TOC](#table-of-contents)

### Summary of Roles
- `request`: Core method to make API calls.
- `login`/`signup`: Handle user authentication.
- `getCurrentUser`/`saveProfile`: Manage user details.
- `getJobs`/`applyToJob`: Interact with job listings.
- `getCompanies`/`getCompany`: Fetch company data.
[back to TOC](#table-of-contents)