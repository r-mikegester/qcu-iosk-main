import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import firebaseConfig, { db } from "../utils/firebase";
import { IonContent, IonPage } from '@ionic/react';
import { Icon } from '@iconify/react';
import { useHistory } from 'react-router-dom';
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import Backbtn from '../components/controls/navigationControls/Backbtn';
import Dock from '../components/controls/navigationControls/dock';
import '../assets/css/search.css';
import '../assets/css/keyboard.css';

interface SearchProps {
  name: string;
}

const Search: React.FC<SearchProps> = ({ name }) => {
  const [keyboard, setKeyboard] = useState< Keyboard | null>(null);
  const [layoutName, setLayoutName] = useState<string>("default");
  const [input, setInput] = useState<string>("");
  const history = useHistory();
  const firestore = getFirestore(initializeApp(firebaseConfig));
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const joinRef = useRef<HTMLDivElement>(null);

  

  useEffect(() => {
    // Initialize Firebase
    const firebaseApp = initializeApp(firebaseConfig);
    const firestore = getFirestore(firebaseApp);

    // Perform any setup or side effects here
    // This effect will run once on mount

    // Cleanup function (equivalent to componentWillUnmount)
    return () => {
      // Perform any cleanup here
    };
  }, []); // Empty dependency array means this effect runs once on mount

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      // Check if the clicked element is inside the "join" class
      if (joinRef.current && joinRef.current.contains(event.target as Node)) {
        // Clicked inside "join" class, keep the dropdown visible
        setIsDropdownOpen(true);
      } else {
        // Clicked outside "join" class, hide the dropdown
        setIsDropdownOpen(false);
      }
    };

    // Add the click event listener to the document
    document.addEventListener("click", handleDocumentClick);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const onChange = (newInput: string) => {
    setInput(newInput);
    console.log("Input changed", newInput);
  };

  const onKeyPress = (button: string) => {
    console.log("Button pressed", button);

    if (button === "{shift}" || button === "{lock}") handleShift();
  };

  const handleShift = () => {
    setLayoutName((prevLayoutName) =>
      prevLayoutName === "default" ? "shift" : "default"
    );
  };

  const onChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    const newInput = event.target.value;
    setInput(newInput);
    if (keyboard) keyboard.setInput(newInput);
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSearch = async () => {
    try {
      // Check if there is a non-empty search term
      if (input.trim() !== "") {
        // Query data from Firestore using the current value of 'input'
        const querySnapshot = await getDocs(collection(db, "buildings"));
        const searchTerm = input.toLowerCase(); // Convert search term to lowercase for case-insensitive comparison
  
        // Flag to check if any matching result is found
        let isMatchFound = false;
  
        querySnapshot.forEach((doc) => {
          // Access the "name" field from the document data
          const buildingName = doc.data().name.toLowerCase(); // Convert building name to lowercase
  
          // Check if the building name contains the search term
          if (buildingName.includes(searchTerm)) {
            // Log only the "name" field for matching results
            console.log(`${doc.id} => Name: ${doc.data().name}`);
            isMatchFound = true;
          }
        });
  
        // If no matching result is found, log an error message
        if (!isMatchFound) {
          console.log("No matching name found");
        }
      } else {
        console.log("Please enter a search term");
      }
    } catch (error) {
      console.error("Error querying Firestore:", error);
    }
  };
  
  

  return (
    <IonPage>
      <IonContent fullscreen className="bg-sc">
        <div className="overflow-hidden ">
          <div className="relative overflow-hidden ">
            <div className="max-w-full px-4 py-10 mx-auto sm:px-6 lg:px-8 sm:py-5">
              <div className="text-center mt-[10px]">
                <h1 className="text-4xl font-bold sm:text-6xl">
                  Search
                </h1>
                <div className="join" ref={joinRef} onClick={handleDropdownToggle}>
                  <div>
                    <div>
                      <input className="input input-bordered bg-white w-[650px] h-16 rounded-2xl text-gray-600 join-item" placeholder="Search..." value={input} onChange={onChangeInput}
                      />
                    </div>
                  </div>

                  <div className="indicator">
                    <button className="w-20 h-16 text-gray-700 bg-white btn hover:bg-gray-300 rounded-2xl join-item" onClick={handleSearch}><Icon icon="wpf:search" className="w-7 h-7" /></button>
                  </div>
                </div>
                {isDropdownOpen && (
                    <div className="dropdown">
                      {/* Your dropdown content goes here */}
                      <p>This is the dropdown content</p>
                    </div>
                  )}

                <div className="hidden">
                  <ul className="justify-center w-5/12 mx-auto mt-5 bg-white menu lg:menu-horizontal rounded-box">
                    <div>
                      <h2 className="text-gray-900">No Results Found</h2>
                    </div>

                  </ul>
                </div>
                <div className="grid grid-cols-1">
                  <div className="mt-5 space-x-2">
                    <div className="text-gray-900 bg-gray-200 badge badge-lg ">Faculties</div>
                    <div className="text-gray-900 bg-gray-200 badge badge-lg ">Facilities</div>
                    <div className="text-gray-900 bg-gray-200 badge badge-lg ">Gymnasium</div>
                    <div className="text-gray-900 bg-gray-200 badge badge-lg ">Departments</div>
                    <div className="text-gray-900 bg-gray-200 badge badge-lg ">SPARD</div>
                    <div className="text-gray-900 bg-gray-200 badge badge-lg ">Parking</div>
                    <div className="text-gray-900 bg-gray-200 badge badge-lg ">Admin</div>

                  </div>

                </div>

                <div className=" mt-20 flex justify-center">
                <Keyboard
                  keyboardRef={(r) => setKeyboard(r)}
                  layoutName={layoutName}
                  onChange={onChange}
                  onKeyPress={onKeyPress}
                  layout={{
                    default: [
                      // Add the layout you provided here
                      "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
                      "{tab} q w e r t y u i o p [ ] \\",
                      "{lock} a s d f g h j k l ; ' {enter}",
                      "{shift} z x c v b n m , . / {shift}",
                      "@ {space} .com"
                    ],
                    shift: [
                      // Add the shifted layout here
                      "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
                      "{tab} Q W E R T Y U I O P { } |",
                      '{lock} A S D F G H J K L : " {enter}',
                      "{shift} Z X C V B N M < > ? {shift}",
                      "@ {space} .com"
                    ]
                  }}
                />
                </div>
              </div>


            </div>
          </div>
        </div>
          <Backbtn name={'Back'} />
          <Dock name={'Dock'} />
        </IonContent>
      </IonPage>
    );
  };
  
export default Search;