import React, { useState, ChangeEvent, useRef, useEffect, Suspense } from "react";
import { IonContent, IonPage } from "@ionic/react";
import "react-simple-keyboard/build/css/index.css";
import Backbtn from "../components/navigation/Backbtn";
import "../assets/css/search.css";
import "../assets/css/keyboard.css";
import KeyboardWrapper from "./keyboard/Keyboard";
import Animation from "../components/campus/sanBartolome/animation/Animation";
// Import your loading component here
import {
  DocumentData,
  Query,
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import firebaseConfig, { db } from "../components/utils/firebase";
import { initializeApp } from "firebase/app";
import Loading from "./loading";

export interface KeyboardRef {
  setInput: (input: string) => void;
  // Add other methods if needed
}

interface Room {
  id: string;
  buildingName: string;
  floorLevel: string;
  roomCode: string;
  roomName: string;
  distance: string;
  eta: string;
  squareMeter: string;
  status: string;
  roomAnimation: string;
  voiceGuide: string;
  textGuide: string;
}

const SearchTab: React.FC = () => {
  const [input, setInput] = useState("");
  const [selectedModelPath, setSelectedModelPath] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isAnimationActive, setIsAnimationActive] = useState(false);
  const keyboard = useRef<KeyboardRef | undefined>(undefined);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isClicked, setIsClicked] = useState(false);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true); // State to track loading status

  useEffect(() => {
    // Fetch data when component mounts
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const roomsCollection = collection(db, "roomData");
      const queryRoom = query(roomsCollection);
      const roomsSnapshot = await getDocs(queryRoom);
      const roomsData = roomsSnapshot.docs.map((doc) => {
        const roomData = doc.data() as Room;
        return { ...roomData, id: doc.id } as Room;
      });

      setRooms(roomsData);
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error("Error fetching rooms: ", error);
    }
  };

  const onChangeInput = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const input = event.target.value.toLowerCase();
    setInput(input);
    keyboard.current?.setInput(input);

    if (rooms.length > 0) {
      const filteredRooms = rooms.filter(
        (room) =>
          (room.roomCode && room.roomCode.toLowerCase().includes(input)) ||
          (room.roomName && room.roomName.toLowerCase().includes(input)) ||
          (room.buildingName && room.buildingName.toLowerCase().includes(input))
      );

      setFilteredRooms(filteredRooms);
    }
  };

  const clickSearch = () => {
    setIsAnimationActive(false);
    return;
  };

  const handleSearchBarClick = () => {
    setIsClicked(true);
  };

  const handleSearchBarBlur = () => {
    setIsClicked(false);
  };

  const handleSuggestionClick = async (
    roomCode: string,
    floorLevel: string,
    roomAnimation: string,
    voiceGuide: string,
    buildingName: string
  ) => {
    const now = serverTimestamp();
    if (roomCode) {
      setSelectedRoom(roomCode);
      setSelectedFloor(floorLevel);
      setSelectedBuilding(buildingName);
      setSelectedModelPath(roomAnimation);
      setSelectedVoice(voiceGuide);
      setIsAnimationActive(true);

      if (roomAnimation) {
        const firestore = getFirestore(initializeApp(firebaseConfig));
        const roomRef = collection(firestore, "visitorData2");
        await addDoc(roomRef, {
          roomCode: roomCode,
          selectedFloor: floorLevel,
          selectedBuilding: buildingName,
          createdAt: now,
        });
      }
    } else {
      console.error("No room selected.");
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="bg-sc">
        {loading ? ( // Render loading component if loading is true
          <div className="h-screen overflow-hidden">
            <div className="relative overflow-hidden ">
              <div className="max-h-screen px-4 mx-auto max-w-screen sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center w-screen h-screen text-center mt-72">
                  <h1 className="w-screen text-4xl font-bold text-center text-white sm:text-6xl">
                    <div className="flex flex-col items-center justify-center w-full gap-4">
                      <div className="w-56 skeleton h-14"></div>
                    </div>
                  </h1>

                  <div className="z-50 flex-col items-center justify-center w-screen h-screen ">
                    <div className="flex items-start justify-center w-screen space-x-3 ">
                      <div className="flex flex-col w-5/12 space-y-3 ">
                        <div className="w-full">
                          <div className="w-full h-16 skeleton"></div>
                        </div>

                        <div className="w-full">
                          <div className="w-auto h-auto bg-white rounded-3xl">
                            <div className="w-full h-64 skeleton"></div>
                          </div>
                        </div>
                      </div>
                      {input && (
                        <div className="w-96">
                          <div className="h-auto p-3 bg-white w-96 rounded-xl">
                            {filteredRooms.length > 0 ? (
                              <div className="w-full py-6 overflow-auto h-96">
                                <h1 className="text-black">Result:</h1>
                                <ul className="px-1 space-y-1">
                                  {filteredRooms
                                    .sort((a, b) =>
                                      a.roomCode.localeCompare(b.roomCode)
                                    )
                                    .map((room, index) => (
                                      <li key={index} className="space-y-2">
                                        <button
                                          className=" btn btn-block btn-primary"
                                          onClick={() =>
                                            handleSuggestionClick(
                                              room.roomCode,
                                              room.floorLevel,
                                              room.roomAnimation,
                                              room.voiceGuide,
                                              room.buildingName
                                            )
                                          }
                                        >
                                          {room.roomCode} - {room.roomName}{" "}
                                          {room.floorLevel} -{" "}
                                          {room.buildingName}

                                        </button>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            ) : (
                              <div className="w-full py-6 overflow-auto h-96">
                                <h1 className="text-black">
                                  No rooms found.
                                </h1>
                                <h1 className="text-black">
                                  Enter another entry.
                                </h1>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Your content here */}
            {selectedModelPath && isAnimationActive ? (
              <Suspense fallback={<Loading />}>

                <Animation
                  name={""}
                  roomName={selectedRoom}
                  modelPath={selectedModelPath}
                  voice={selectedVoice}
                  selectedBuilding={selectedBuilding}
                  selectedFloor={selectedFloor}
                  selectedRoom={selectedRoom}
                />
                <button
                  onClick={clickSearch}
                  className="absolute z-10 mt-10 btn btn-secondary ml-60"
                >
                  Back
                </button>
              </Suspense>
            ) : (
              <>
                {/* Your content here */}

                <div className="w-screen h-screen overflow-hidden">
                  {/* BACK BUTTON */}
                  <div className="">
                    <div className="z-50 w-full h-full ">
                      {/* <div className="h-full p-5 bg-red-500 w-fit">
                        <div className="z-50">
                          <Backbtn name={""} />
                        </div>
                      </div> */}
                      <div className="flex items-start justify-between p-6">
                        <div className="z-50 flex flex-col items-center justify-center p-6 space-y-3 bg-red-500 w-[48%]">
                          <h1 className="w-full text-4xl font-bold text-center text-white sm:text-6xl">
                            Search
                          </h1>
                          <div className="flex justify-center w-full">
                            <input
                              value={input}
                              placeholder={"Are you looking for something?"}
                              onChange={(e) => onChangeInput(e)}
                              onClick={handleSearchBarClick}
                              onBlur={handleSearchBarBlur}
                              className="z-50 w-10/12 h-16 p-6 text-black bg-white outline-none rounded-xl"
                            />
                          </div>

                          <div className="w-full">
                            <div className="h-auto bg-base-200 rounded-3xl">
                              <KeyboardWrapper
                                keyboardRef={keyboard}
                                onChange={setInput}
                                onFilteredRoomsChange={setFilteredRooms}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="w-3/12 h-screen bg-white rounded-3xl">
                          <div className="w-full p-3 bg-green-500 shadow-inner h-6/12 rounded-3xl">
                            {filteredRooms.length > 0 ? (
                              <div className="w-full h-full py-6 pt-0 overflow-auto">
                                <div className="bg-base-100 w-[436px] h-20 fixed  -z-1">
                                  <h1 className="text-4xl font-bold text-black">Result:</h1>
                                </div>
                                <ul className="px-1 space-y-3 mt-28">
                                  {filteredRooms
                                    .sort((a, b) =>
                                      a.roomCode.localeCompare(b.roomCode)
                                    )
                                    .map((room, index) => (
                                      <li key={index} className="space-y-3">
                                        <button
                                          className="text-left shadow-inner h-28 btn btn-block btn-primary rounded-3xl"
                                          onClick={() =>
                                            handleSuggestionClick(
                                              room.roomCode,
                                              room.floorLevel,
                                              room.roomAnimation,
                                              room.voiceGuide,
                                              room.buildingName
                                            )
                                          }
                                        >

                                          <div className="flex flex-col justify-start w-full ">
                                            <div className="flex space-x-3 text-sm">
                                              <div>{room.buildingName}</div>
                                              <div>{room.floorLevel}</div>
                                            </div>
                                            <div className="flex justify-between ">

                                              <div className="text-xl">{room.roomName}</div>{" "}
                                              <div className="flex flex-col items-end justify-center">

                                                <div className="badge badge-lg">{room.roomCode}</div>
                                              </div>


                                            </div>
                                          </div>
                                        </button>
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            ) : (
                              <div className="w-full py-6 overflow-auto h-96">
                                <h1 className="text-black">
                                  No rooms found.
                                </h1>
                                <h1 className="text-black">
                                  Enter another entry.
                                </h1>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>


                </div>

                {/* <div className="w-screen h-screen overflow-hidden">
                  <div className="relative w-screen h-fit">
                    <div className="w-screen max-h-screen mx-auto max-w-screen">
                      <div className="flex flex-col items-center justify-center w-screen h-screen text-center ">


                        <div className="z-50 w-screen h-screen bg-blue-500">
                          <div className="flex items-center justify-between w-screen p-5 bg-blue-900">
                            <div className="flex flex-col items-center justify-center w-5/12 space-y-3 bg-green-500">
                              <h1 className="w-full text-4xl font-bold text-center text-white bg-red-900 sm:text-6xl">
                                Search
                              </h1>
                              <div className="w-full">
                                <input
                                  value={input}
                                  placeholder={"Are you looking for something?"}
                                  onChange={(e) => onChangeInput(e)}
                                  onClick={handleSearchBarClick}
                                  onBlur={handleSearchBarBlur}
                                  className="z-50 w-full h-16 p-5 text-black bg-white outline-none rounded-xl"
                                />
                              </div>

                              <div className="w-full">
                                <div className="w-auto h-auto bg-white rounded-3xl">
                                  <KeyboardWrapper
                                    keyboardRef={keyboard}
                                    onChange={setInput}
                                    onFilteredRoomsChange={setFilteredRooms}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="w-3/12 h-screen bg-white rounded-3xl">
                              <div className="w-full h-full p-3 bg-white shadow-inner rounded-3xl">
                                {filteredRooms.length > 0 ? (
                                  <div className="w-full h-full py-6 pt-0 overflow-auto">
                                    <div className="bg-base-100 w-[436px] h-20 fixed  -z-1">
                                      <h1 className="text-4xl font-bold text-black">Result:</h1>
                                    </div>
                                    <ul className="px-1 space-y-3 mt-28">
                                      {filteredRooms
                                        .sort((a, b) =>
                                          a.roomCode.localeCompare(b.roomCode)
                                        )
                                        .map((room, index) => (
                                          <li key={index} className="space-y-3">
                                            <button
                                              className="text-left shadow-inner h-28 btn btn-block btn-primary rounded-3xl"
                                              onClick={() =>
                                                handleSuggestionClick(
                                                  room.roomCode,
                                                  room.floorLevel,
                                                  room.roomAnimation,
                                                  room.voiceGuide,
                                                  room.buildingName
                                                )
                                              }
                                            >

                                              <div className="flex flex-col justify-start w-full ">
                                                <div className="flex space-x-3 text-sm">
                                                  <div>{room.buildingName}</div>
                                                  <div>{room.floorLevel}</div>
                                                </div>
                                                <div className="flex justify-between ">

                                                  <div className="text-xl">{room.roomName}</div>{" "}
                                                  <div className="flex flex-col items-end justify-center">

                                                    <div className="badge badge-lg">{room.roomCode}</div>
                                                  </div>


                                                </div>
                                              </div>
                                            </button>
                                          </li>
                                        ))}
                                    </ul>
                                  </div>
                                ) : (
                                  <div className="w-full py-6 overflow-auto h-96">
                                    <h1 className="text-black">
                                      No rooms found.
                                    </h1>
                                    <h1 className="text-black">
                                      Enter another entry.
                                    </h1>
                                  </div>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}
                {/* <Backbtn name={"Back"} /> */}
              </>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default SearchTab;
