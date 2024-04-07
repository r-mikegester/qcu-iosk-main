import React, {
  useState,
  ChangeEvent,
  useRef,
  Suspense,
  useEffect,
} from "react";
import { IonContent, IonPage } from "@ionic/react";
import "react-simple-keyboard/build/css/index.css";
import Backbtn from "../components/navigation/Backbtn";
import "../assets/css/search.css";
import "../assets/css/keyboard.css";
import KeyboardWrapper from "./keyboard/Keyboard";
import Animation from "../components/campus/sanBartolome/animation/Animation";
import SideBar from "../components/sidebar/sidebarLayout";
import WidgetPanel from "../components/widgets/widgetPanel";
import Loading from "../pages/loading";
import {
  DocumentData,
  Query,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../components/utils/firebase";

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
          (room.roomName && room.roomName.toLowerCase().includes(input))
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
    voiceGuide: string
  ) => {
    if (roomCode) {
      setSelectedRoom(roomCode);
      setSelectedFloor(floorLevel);
      setSelectedModelPath(roomAnimation);
      setSelectedVoice(voiceGuide);
      setIsAnimationActive(true);
    } else {
      console.error("No room selected.");
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="bg-sc">
        <>
          {selectedModelPath && isAnimationActive ? (
            <>
              <Suspense fallback={<Loading name="" />}>
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
            </>
          ) : (
            <>
              <div className="h-screen overflow-hidden">
                <div className="relative overflow-hidden ">
                  <div className="max-h-screen px-4 mx-auto max-w-screen sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center w-screen h-screen text-center mt-72">
                      <h1 className="w-screen text-4xl font-bold text-center text-white sm:text-6xl">
                        "Search"
                      </h1>

                      <div className="z-50 flex-col items-center justify-center w-screen h-screen ">
                        <div className="flex items-start justify-center w-screen space-x-3 ">
                          <div className="flex flex-col w-5/12 space-y-3 ">
                            <div className="w-full">
                              <input
                                value={input}
                                placeholder={
                                  "Tap on the virtual keyboard to start"
                                }
                                onChange={(e) => onChangeInput(e)}
                                onClick={handleSearchBarClick}
                                onBlur={handleSearchBarBlur}
                                className="z-50 w-full h-16 p-5 text-black bg-white outline-none rounded-3xl"
                              />
                            </div>

                            <div className="w-full">
                              <div className="w-auto h-auto ">
                                <KeyboardWrapper
                                  keyboardRef={keyboard}
                                  onChange={setInput}
                                  onFilteredRoomsChange={setFilteredRooms}
                                />
                              </div>
                            </div>
                          </div>
                          {input && (
                            <div className="w-96">
                              <div className="h-auto p-3 bg-white w-96 rounded-3xl">
                                {filteredRooms.length > 0 ? (
                                  <div className="w-full py-6 overflow-auto h-96">
                                    <h1 className="text-black">Result:</h1>
                                    <ul className="px-1 space-y-1">
                                      {filteredRooms
                                        .sort((a, b) =>
                                          a.roomCode.localeCompare(b.roomCode)
                                        )
                                        .map((room, index) => (
                                          <li key={index} className="space-">
                                            <button
                                              className=" btn btn-block btn-secondary"
                                              onClick={() =>
                                                handleSuggestionClick(
                                                  room.roomCode,
                                                  room.floorLevel,
                                                  room.roomAnimation,
                                                  room.voiceGuide
                                                )
                                              }
                                            >
                                              {room.roomCode} -{" "}
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
              {/* <Backbtn name={"Back"} /> */}
            </>
          )}
        </>
      </IonContent>
    </IonPage>
  );
};

export default SearchTab;
