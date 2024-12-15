# How React Context API Protects Routes, Links, and Pages
The React Context API is used here to manage **global user state** and determine if a user is authenticated. This user information is shared across components like `Homepage.js`, `Navigation.js`, and `RoutesList.js` using the `UserContext` variable created by `UserContext.js`.

## Step-by-Step Explanation

### 1. App.js: Setup of React Context
- `App.js` declares a `UserContext.Provider` and passes `currentUser` and helper functions (`setCurrentUser`, `hasAppliedToJob`, `applyToJob`) as its ***context value***:
```jsx
 return (
    <UserContext.Provider
      value={{
        currentUser: currentUser.data,
        setCurrentUser,
        hasAppliedToJob,
        applyToJob,
      }}
    >
      <div className="App">
        <Navigation logout={logout} />
        <RoutesList
          currentUser={currentUser.data}
          login={login}
          signup={signup}
        />
      </div>
    </UserContext.Provider>
  );
```

#### **Purpose**: This makes the user data and helper functions accessible to any component that consumes the `UserContext`.
#### **How It Works**:
- `currentUser` is set to:
    - `null` → when no user is logged in.
    - An object containing user details → when a user is **authenticated**.

### 2. UserContext.js: Creating the Context
The context is created in `UserContext.js`:
```javascript
const UserContext = React.createContext();
export default UserContext;
```
`React.createContext()` creates the `UserContext` object, which can be used by:
- `Provider`: Supplies values to the context.
- `useContext`: Consumes the context.

### 3. Homepage.js: Conditionally Rendering Content

The `Homepage.js` file uses `useContext(UserContext)` to access `currentUser`:
```javascript
const { currentUser } = useContext(UserContext);
```
The purpose of this code is to protect content based on whether the user is authenticated.

**How It Works**:

- If `currentUser` exists (i.e., user is logged in), the homepage shows a personalized welcome message:

```jsx
Welcome Back, {currentUser.firstName || currentUser.username}!
```

- If `currentUser` is `null`, it displays login and signup buttons:
```jsx
<Link className="btn btn-primary" to="/login">Log in</Link>
<Link className="btn btn-primary" to="/signup">Sign up</Link>
```

### 4. Navigation.js: Protecting Navbar Links

`Navigation.js` also uses `useContext(UserContext)` to check the `currentUser` state:

```javascript
const { currentUser } = useContext(UserContext);
```

The purpose of this code is to dynamically controls navigation links based on authentication status.

**How It Works:**

If `currentUser` exists, the navbar displays links to **protected pages**:
```jsx
<NavLink className="nav-link" to="/companies">Companies</NavLink>
<NavLink className="nav-link" to="/jobs">Jobs</NavLink>
<NavLink className="nav-link" to="/profile">Profile</NavLink>
```

If `currentUser` is `null`, it shows links to **login** and **signup**
```jsx
<NavLink className="nav-link" to="/login">Login</NavLink>
<NavLink className="nav-link" to="/signup">Sign Up</NavLink>
```

### 5. RoutesList.js: Protecting Routes

`RoutesList.js` uses the `currentUser` prop to conditionally render routes.
The purpose of this code is to prevent unauthorized users from accessing protected pages like `/companies`, `/jobs`, and `/profile`.

**How It Works:**
1. If `currentUser` is `null` (user not logged in):
- Only the `/login` and `/signup` routes are accessible:
```jsx
{!currentUser && (
  <>
    <Route path="/login" element={<LoginForm login={login} />} />
    <Route path="/signup" element={<SignupForm signup={signup} />} />
  </>
)}
```

2. If `currentUser` exists (user is logged in):
- The following **protected routes** are available:
```jsx
{currentUser && (
  <>
    <Route path="/companies" element={<CompanyList />} />
    <Route path="/jobs" element={<JobList />} />
    <Route path="/companies/:handle" element={<CompanyDetail />} />
    <Route path="/profile" element={<ProfileForm />} />
  </>
)}
```

3. The default route redirects to the homepage (`/`) if the user visits an invalid path:
```jsx
<Route path="*" element={<Navigate to="/" />} />
```

## Data Flow

1. `App.js`:
- Wraps the entire app in `UserContext.Provider` and provides `currentUser` data.

2. `Homepage.js`:
- Consumes `UserContext` and conditionally renders:
    - A personalized message for logged-in users.
    - Login/Signup buttons for unauthorized users.

3. Navigation.js:
- Consumes `UserContext` to display:
    - Links to protected pages when `currentUser` is authenticated.
    - Links to login and signup when `currentUser` is `null`.

4. RoutesList.js:
- Protects routes:
    - Renders protected routes only if `currentUser` exists.
    - Redirects unauthorized users to the homepage or `/login`.


### 6. ProfileForm.js - Access & Update Global User State

The React Context API is used in `ProfileForm.js` to access and update the global user state, specifically the current user’s profile data, across the entire application. This allows changes to the user profile to propagate immediately and consistently to all components consuming the user context.

#### 1. Accessing UserContext
At the beginning of the `ProfileForm` component, the React Context API is used to consume the `UserContext`
```javascript
const { currentUser, setCurrentUser } = useContext(UserContext);
```
- `currentUser`: Holds the current user data (like `username`, `firstName`, `lastName`, and `email`).
- `setCurrentUser`: A function to update the global user state when the user’s profile data is saved.
**How It Works**:
- `currentUser` is provided to the component by `UserContext.Provider` in `App.js`.
- Since React Context makes `currentUser` globally accessible, there’s no need to pass this data down as props.

#### 2. Initializing Local State with `currentUser`
The `currentUser` data is used to initialize the **local state** for the form fields: 
```javascript
const [formData, setFormData] = useState({
  firstName: currentUser.firstName,
  lastName: currentUser.lastName,
  email: currentUser.email,
  username: currentUser.username,
});
```
This causes the form to be pre-filled with the user’s current profile data, making it editable.

#### 3. Updating Profile on Form Submission

When the user submits the form:
```javascript
async function handleSubmit(evt) {
  evt.preventDefault();

  let profileData = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
  };

  let username = formData.username;
  let updatedUser;

  try {
    updatedUser = await JoblyApi.saveProfile(username, profileData);
  } catch (errors) {
    setFormErrors(errors);
    return;
  }

  setFormData((f) => ({ ...f }));
  setFormErrors([]);
  setSaveConfirmed(true);

  // trigger reloading of user information throughout the site
  setCurrentUser((currentUser) => ({
    ...currentUser,
    data: updatedUser,
  }));
}
```

**Key Steps in handleSubmit**

1. Prevent Default Behavior:

- Prevents the page from reloading when the form is submitted.

2. Prepare Form Data:

- Extracts `firstName`, `lastName`, and `email` from `formData` to send to the API.

3. Send Data to Backend:

Calls the JoblyApi.saveProfile() method to update the user profile on the backend:
```javascript
updatedUser = await JoblyApi.saveProfile(username, profileData);
```

4. Handle Errors:

- If the API call fails, the error messages are stored in `formErrors` and displayed on the form.

5. Update React Context (`setCurrentUser`):

If the update succeeds, `setCurrentUser` is called to update the global user state:
```javascript
setCurrentUser((currentUser) => ({
  ...currentUser,
  data: updatedUser,
}));
```

6. Confirm Save:

- Sets `saveConfirmed` to `true` to show a success message.

#### 4. Dynamic UI Updates
React Context ensures that the updated user information is immediately available throughout the application.

Immediate Feedback:
- On a successful update, the `ProfileForm` displays a success alert:
```javascript
{saveConfirmed ? (
  <Alert type="success" messages={["Updated successfully."]} />
) : null}
```

Form Validation:

If errors occur during submission, they are displayed using the `Alert` component:
```javascript
{formErrors.length ? (
  <Alert type="danger" messages={formErrors} />
) : null}
```

#### 5. Handling Input Changes
As the user types into the form fields, handleChange updates the local form state:
```javascript
function handleChange(evt) {
  const { name, value } = evt.target;
  setFormData((f) => ({
    ...f,
    [name]: value,
  }));
  setFormErrors([]);
}
```
**How It Works:**
- Extracts the `name` and `value` of the input field being edited.
- Updates the corresponding field in the `formData` state.

#### How React Context Protects and Updates the User Data

1. Access to Global State:

The `currentUser` value provided by `UserContext` ensures the form always reflects the current user data.

2. Centralized Updates:

Calling `setCurrentUser` updates the user data in the React Context, ensuring consistency across all components.

3. Seamless Integration:

Other components consuming `UserContext` (e.g., `Navigation.js`, `Homepage.js`) automatically reflect the updated user data without additional configuration.

4. Form Security:

The `username` field is disabled to prevent changes:
```jsx
<input disabled className="form-control" placeholder={formData.username} />
```

#### Data Flow Summary

1. Initial Data:

`currentUser` is accessed from `UserContext` to pre-fill the form.

2. Form Submission:

The `handleSubmit` function sends the updated data to the backend via `JoblyApi.saveProfile`.

3. Global State Update:

The backend returns the updated user data and `setCurrentUser` updates the global user state in `UserContext`.

4. UI Updates:

Success and error messages dynamically appear based on the API response.

## Summary

1. Global State Management:

- The `UserContext` is used to store and share user authentication data (`currentUser`).

2. Context Consumption:

- `useContext(UserContext)` allows components (`Homepage.js`, `Navigation.js`, and `RoutesList.js`) to access the global `currentUser` state.

3. Route Protection:

- Protected Pages: Rendered only when `currentUser` exists.
- Public Pages: Accessible to everyone (e.g., `/login` and `/signup`).
4. Dynamic UI Rendering:

- Navbar and homepage content dynamically adapt based on whether the user is logged in.

## Why Use React Context Here?

- Avoids prop drilling: User data is globally available without needing to pass props deeply.
- Keeps the code clean: Route protection and conditional rendering are handled efficiently.
- Centralizes state: `currentUser` is managed in a single place (`App.js`) and shared across components.