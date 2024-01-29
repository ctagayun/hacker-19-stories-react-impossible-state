/*================================================================
 React Impossible State
    Technically, all states related to the asynchronous data 
  belong together, which doesn't only include the 
      1. stories as actual data
      2. but also their loading
      3. and error states. 
  That's where one reducer and React's useReducer Hook come 
  into play to manage domain related states. 

     The impossible state happens when an error occurs for the 
 asynchronous data. The state for the error is set, but the state 
 for the loading indicator isn't revoked.

 Fortunately, we can improve our chances of not dealing with such 
 bugs by moving states that belong together from multiple useState 
 (and useReducer) hooks into a single useReducer hook.

 Take the following hooks: And merge them into one useReducer 
 hook for a unified state
      const App = () => {
      ...
      const [stories, dispatchStories] = React.useReducer(
        storiesReducer,
        []
      );
      const [isLoading, setIsLoading] = React.useState(false);
      const [isError, setIsError] = React.useState(false);
      ...
    };
 
  TO DO:
     First create a reducer function outside of the component.
  A reducer function always receives a state and an action. 
  Based on these two arguments, a reducer always returns 
  a new state.

  Review what is useState?
      - https://www.robinwieruch.de/react-usestate-hook/

      - When a state gets mutated, the component with the state 
      and all child components will re-render.

  Review what is useEffect?
    - https://www.robinwieruch.de/react-useeffect-hook/
    
    - What does useEffect do? by using this hook you tell React that 
     your component needs to do something after render.

  Review what is a React.Reducer
    - https://www.robinwieruch.de/javascript-reducer/

=============================================*/
import * as React from 'react';

const initialStories = [
  {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];

//Function that fetch data
const getAsyncStories = () =>
  new Promise((resolve) =>
    setTimeout(
      () => resolve({ data: { stories: initialStories } }),
      2000
    )
  );

  /*
    Again the first thing to do when using React.useReducer hook
  is to define a reducer function outside of the component.
  A reducer function always receives a state and an action. 
  Based on these two arguments, returns a new state.

  In this section We need to change the storiesReducer() function
     const storiesReducer = (state, action) => {
     if (action.type === 'SET_STORIES') {
       return action.payload;
     } else {
      throw new Error();
     }};

   We changed two things from the above original reducer function. 
   1. First, we introduced new types when we called the dispatch 
      function from the outside. 
      Therefore we need to add the following new cases for state transitions.
         'STORIES_FETCH_INIT' 
         'STORIES_FETCH_SUCCESS'
         'STORIES_FETCH_FAILURE'
         'REMOVE_STORY'
         throw new Error();

   2. Second, we changed the state structure from an array to 
      a complex object. Therefore we need to take the new complex 
      object into account as incoming state and returned state:

   3.For every state transition, we return a new state object 
     which contains all the key/value pairs from the current 
     state object (via JavaScript's spread operator ...state) and 
     the new over writing properties 

     

  */
const storiesReducer = (state, action) => {
  
  switch (action.type) {
    case 'STORIES_FETCH_INIT': //distinct type and payload 
                               //received by dispatchStories 
                               //dispatch function
                               //so we need to add it here
      return {
        ...state, //return new state object with KV pairs 
                  //via spread operator from current state object
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS': //distinct type and payload 
                                  //received by dispatchStories 
                                  //dispatch function
                                  //so we need to add it here
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'STORIES_FETCH_FAILURE': //another distinct type and payload 
                                  //received by dispatchStories 
                                  //dispatch function 
                                  //so we need to add it here
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORY':  //another distinct type and payload 
                          //received by dispatchStories 
                          //dispatch function
                          //so we need to add it here
                     //Observe how the REMOVE_STORY action 
                     //changed as well. It operates on the 
                     //state.data, and no longer just on the
                     // plain "state".
      return {
        ...state,        
        data: state.data.filter( //now operate on state.data not just "state"
          (story) => action.payload.objectID !== story.objectID
        ),
      };
    default:              //another distinct type and payload
                          //received by dispatchStories 
                          //dispatch function
                          //so we need to add it here
      throw new Error();
  }
};

const useStorageState = (key, initialState) => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

const App = () => {
  const [searchTerm, setSearchTerm] = useStorageState(
    'search',
    'React'
  );
 
 /* Take the following hooks: And merge them into one useReducer 
 hook for a unified state. Because echnically, all states related 
 to the asynchronous data belong together, which doesn't only 
 include the stories as actual data, but also their loading and 
 error states.

    That's where one reducer and React's useReducer Hook come 
 into play to manage domain related states.
      const App = () => {
      ...
      const [stories, dispatchStories] = React.useReducer(
        storiesReducer,
        []
      );
      const [isLoading, setIsLoading] = React.useState(false);
      const [isError, setIsError] = React.useState(false);
      ...
    };
    */

  //data: [], isLoading, isError flags hooks merged into one 
  //useReducer hook for a unified state.
  const [stories, dispatchStories] = React.useReducer(  //(A)
    storiesReducer,
    { data: [], isLoading: false, isError: false } 
                                //We want an empty list data = [] 
                                 //isloading=false
                                 //is error=false
  );

  //After merging the three useState hooks into one Reducer hook,
  //we cannot use the state updater functions from React's 
  //useState Hooks anymore like:
  //     setIsLoading, setIsError
  //everything related to asynchronous data fetching must now use 
  //the new dispatch function "dispatchStories" see (A)
  //for updating state transitions 

  React.useEffect(() => {
    //dispatchStories receiving different payload
    dispatchStories({ type: 'STORIES_FETCH_INIT' }); //initialization
                  //dispatchStories receives STORIES_FETCH_INIT as type

    getAsyncStories()
      .then((result) => {
        dispatchStories({ //for getAsyncStories() dispatchStories receives STORIES_FETCH_SUCCESS as type
          type: 'STORIES_FETCH_SUCCESS',  
          payload: result.data.stories,
        });
      })
      .catch(() => //for error condition, dispatchStories receives STORIES_FETCH_FAILURE as type
        dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
      );
  }, []);

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  //by addressing the state as object and not as array anymore,
  //note that it operates on the state.data no longer on the plain state.
  const searchedStories = stories.data.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>My Hacker Stories</h1>

      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearch}
      >
        <strong>Search:</strong>
      </InputWithLabel>

      <hr />

       
      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List
          list={searchedStories}
          onRemoveItem={handleRemoveStory}
        />
      )}
    </div>
  );
};

const InputWithLabel = ({
  id,
  value,
  type = 'text',
  onInputChange,
  isFocused,
  children,
}) => {
  const inputRef = React.useRef();

  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor={id}>{children}</label>
      &nbsp;
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
      />
    </>
  );
};

const List = ({ list, onRemoveItem }) => (
  <ul>
    {list.map((item) => (
      <Item
        key={item.objectID}
        item={item}
        onRemoveItem={onRemoveItem}
      />
    ))}
  </ul>
);

const Item = ({ item, onRemoveItem }) => (
  <li>
    <span>
      <a href={item.url}>{item.title}</a>
    </span>
    <span>{item.author}</span>
    <span>{item.num_comments}</span>
    <span>{item.points}</span>
    <span>
      <button type="button" onClick={() => onRemoveItem(item)}>
        Dismiss
      </button>
    </span>
  </li>
);

export default App;

//========================================================== 
 //Note on Map:
 //Within the map() method, we have access to each object and its properties.
 
 //useState
 //By using useState, we are telling React that we want to have a 
 //stateful value which changes over time. And whenever this stateful value 
 //changes, the affected components (here: Search component) 
 //will re-render to use it (here: to display the recent value).

 /* 
     The filter() method takes a function 
        as an argument, which accesses each item in the array and returns /
        true or false. If the function returns true, meaning the condition is 
        met, the item stays in the newly created array; if the function 
        returns false, it's removed from the filtered array.

  
 */
 
 /*Note on Map:
   Within the map() method, we have access to each object and its properties.

 // concatenating variables into a string
    var fullName = `${firstName} ${lastName}`
    console.log(fullName);


 //useState
    By using useState, we are telling React that we want to have a 
 stateful value which changes over time. And whenever this stateful value 
 changes, the affected components (here: Search component) 
 will re-render to use it (here: to display the recent value).

  //Work flow of a useState:
       When the user types into the input field, the input field's change event 
      runs into the event handler. The handler's logic uses the event's value 
      of the target and the state updater function to set the updated state. 
      Afterward, the component re-renders (read: the component function runs). 
      The updated state becomes the current state (here: searchTerm) and is 
      displayed in the component's JSX.

  //Arrow Function
    function getTitle(title) { - convert to arrow function see below
    
    const getTitle =(title) => 
       (
        title
       );

    Eliminate bracket and "return" statement if no business logic before 
    the function - concise
   

  //Arrow function - 
   If there is a business business logic. Otherwise retain the {} and
   put a "return" statement 
     const App = () => {
       ...
       return xyz;
     } 
 
  //How to use a React.Reducer hook 
  To use Reducer (1) first define a reducer function.
     1. A reducer action is always associated with a type. As best 
        practice with a payload.
        Example:
          const storiesReducer = (state, action) =>{
          if (action.type === 'SET_STORIES'){
            //If the type matches a condition in the reducer. Return a new
            //state based on the incoming state and action
            return action.payload;
          }
          else{
          //throw an error if isn't covered by the reducer to remind yourself
          //that the implementation is not covered
            throw new Error();
          }
        }
      2. The second thing to do is to replaceReact.useState to use a reducer hook
         like this: 

          const [stories, dispatchStories] = React.useReducer(storiesReducer,[]);

          1. receives a reducer function called "storiesReducer"
          2. receives an initial state of empty array []
          3. returns an array with 2 item: 
            - The first item is "stories" which is the current state
            - The second item is the updater function named "dispatchStories"
            Unlike useState, the updater function of Reducer sets the state
            "implicitly" by dispatching an "action". Example:
               dispatchStories({
                 type: 'SET_STORIES',   <== this is the action
               payload: result.data.stories,
             });
       
 */