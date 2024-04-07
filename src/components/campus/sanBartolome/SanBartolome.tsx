import React, { Suspense, useCallback, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import ModelViewer from "./ModelViewer";
import { OrbitControls, Stage, Stars } from "@react-three/drei";
import Modal from "react-modal";
import { Icon } from "@iconify/react";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import firebaseConfig, { db } from "../../utils/firebase";
import { initializeApp } from "firebase/app";
import Animation from "./animation/Animation";
import Clouds from "./Clouds";

interface ContainerProps {
  name: string;
}

interface Building {
  id: string;
  buildingName: string;
  buildingPath: string;
  buildingPosition: [number, number, number];
  buildingScale: [number, number, number];
  buildingLabelPosition: [number, number, number];
  status: string;
  totalFloor: string;
}

interface otherModel {
  id: string;
  modelPath: string;
  modelPosition: [number, number, number];
  modelScale: [number, number, number];
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

const SanBartolome: React.FC<ContainerProps> = ({ name }) => {
  const firestore = getFirestore(initializeApp(firebaseConfig));

  const [isNight, setIsNight] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [otherModel, setOtherModel] = useState<otherModel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showOverview, setShowOverview] = useState(false);

  const [animation, setAnimation] = useState("");
  const [selectedRoomModel, setSelectedRoomModel] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");

  const [modalContent, setModalContent] = useState(
    "Selected room data not found."
  );
  const [errorModal, setErrorModal] = useState(false);
  const [showBuildingInfo, setBuildingInfoModal] = useState(false);

  const uniqueFloorLevels = [
    ...new Set(
      rooms
        .filter((room) => room.buildingName === selectedBuilding)
        .map((room) => room.floorLevel)
    ),
  ];

  const closeModal = () => {
    setShowModal(false);
    setErrorModal(false);
    setBuildingInfoModal(false);
  };

  const closeErrorModal = () => {
    setShowModal(true);
    setErrorModal(false);
    setBuildingInfoModal(false);
  };

  const closeBuildingInfoModal = () => {
    setBuildingInfoModal(false);
  };

  const handleOverviewClick = () => {
    setShowOverview(true);
  };

  const handleFloorsClick = () => {
    setShowOverview(false);
  };

  const clickFloor = useCallback((floor: string, floorLevel: string) => {
    console.log("Selected floor:", floorLevel);
    setSelectedFloor(floorLevel);
    setShowOverview(false);
  }, []);

  const selectRoom = useCallback((room: Room) => {
    console.log("Selected Room:", room);
    setSelectedRoom(room);
  }, []);

  const clickSB = () => {
    setShowModal(false);
    return;
  };

  const handleBuildingInfoClick = async () => {
    setBuildingInfoModal(true);
  };

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const buildingsCollection = collection(db, "buildingData");
        const queryBuilding = query(buildingsCollection);
        const buildingsSnapshot = await getDocs(queryBuilding);
        const buildingsData = buildingsSnapshot.docs.map((doc) => {
          const buildingData = doc.data() as Building;
          return { ...buildingData, id: doc.id } as Building;
        });
        setBuildings(buildingsData);
      } catch (error) {
        console.error("Error fetching buildings: ", error);
      }
    };

    fetchBuildings();
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const modelsCollection = collection(db, "otherModelData");
        const queryModel = query(modelsCollection);
        const modelsSnapshot = await getDocs(queryModel);
        const modelsData = modelsSnapshot.docs.map((doc) => {
          const modelData = doc.data() as otherModel;
          return { ...modelData, id: doc.id } as otherModel;
        });
        setOtherModel(modelsData);
      } catch (error) {
        console.error("Error fetching models: ", error);
      }
    };

    fetchModels();
  }, []);

  useEffect(() => {
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

    fetchRooms();
  }, []);

  useEffect(() => {
    const checkTime = () => {
      const currentTime = new Date();
      const currentHour = currentTime.getHours();

      const isNightTime = currentHour >= 18 || currentHour < 6;

      setIsNight(isNightTime);
    };

    checkTime();

    const intervalId = setInterval(checkTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleModelClick = useCallback((buildingName: string) => {
    setSelectedBuilding(buildingName);
    setShowModal(true);
    console.log(`Clicked on ${buildingName}`);
  }, []);

  const clickAnimation = async (roomCode: string) => {
    try {
      const roomData = rooms.find(
        (room) =>
          room.roomCode === roomCode &&
          room.buildingName === selectedBuilding &&
          room.floorLevel === selectedFloor
      );

      if (roomData) {
        setAnimation(roomData.roomCode);
        setSelectedRoomModel(roomData.roomAnimation);
        setSelectedVoice(roomData.voiceGuide);
        setErrorModal(true);
      } else {
        setModalContent("Selected room data not found.");
      }
    } catch (error) {
      console.error("Error fetching animation data:", error);
    }
  };

  return (
    <>
      {selectedRoomModel && animation ? (
        <>
          <Animation
            name={""}
            roomName={selectedRoom?.roomName || ""}
            modelPath={selectedRoomModel}
            voice={selectedVoice}
            selectedBuilding={selectedBuilding}
            selectedFloor={selectedFloor}
            selectedRoom={selectedRoom?.roomCode || ""}
          />
          <button
            onClick={clickSB}
            className="absolute z-10 mt-10 btn btn-secondary ml-60"
          >
            Back
          </button>
        </>
      ) : (
        <>
          <Canvas
            camera={{
              fov: 50,
              position: [80, 40, 80],
            }}
            className={
              isNight
                ? "bg-gradient-to-tr from-stone-950 to-cyan-950"
                : "bg-gradient-to-tr from-sky-900 to-sky-400"
            }
            style={{ position: "absolute" }}
          >
            <OrbitControls
              minPolarAngle={Math.PI / 6} // vertical rotation
              maxPolarAngle={Math.PI / 2.5} // vertical rotation
              enablePan={true}
              zoomSpeed={1} // based sa touchpad
              autoRotate={true}
              autoRotateSpeed={0.3}
              enableZoom={true}
              minDistance={50}
              maxDistance={100}
            />

            <Stage shadows environment={isNight ? "night" : "city"}>
              {isNight ? (
                <>
                  <Stars radius={50} depth={30} count={100} factor={3} />
                </>
              ) : null}
              {otherModel.map((model) => (
                <ModelViewer
                  key={model.id}
                  modelPath={model.modelPath}
                  position={model.modelPosition}
                  scale={model.modelScale}
                />
              ))}

              {buildings.map((building) => (
                <ModelViewer
                  key={building.id}
                  name={building.buildingName}
                  modelPath={building.buildingPath}
                  position={building.buildingPosition}
                  scale={building.buildingScale}
                  textPosition={building.buildingLabelPosition}
                  onClick={() => handleModelClick(building.id)}
                />
              ))}

              {/* <RotatingMesh /> */}
            </Stage>
          </Canvas>
          <Modal
            className="flex items-center justify-center w-screen h-screen bg-black/60 text-base-content"
            isOpen={showModal}
            onRequestClose={closeModal}
            contentLabel="Building Information"
          >
            <div className="w-6/12 py-0 pl-0  shadow-xl m-80 bg-base-100 rounded-3xl h-fit">
              <div className="relative flex justify-center space-x-3">
                <div className="w-20 h-full px-3 mr-2 shadow-lg rounded-3xl">
                  <div className="flex flex-col justify-center py-3 space-y-3 border-b-2 border-base-100">
                    {selectedBuilding && (
                      <>
                        <>
                          <button
                            onClick={handleFloorsClick}
                            className={`h-10 btn  hover:bg-base-content hover:text-base-300 ${!showOverview
                              ? "bg-transparent btn-block shadow-none text-lg text-base-content"
                              : ""
                              }`}
                          >
                            Floors
                          </button>
                        </>
                      </>
                    )}
                  </div>
                  {showOverview ? (
                    <>
                      <div className="h-full overflow-y-auto"></div>
                    </>
                  ) : (
                    <div>
                      {selectedBuilding && !showOverview && (
                        <div className="h-full overflow-y-auto">
                          <div className="grid grid-cols-1 gap-2 my-3">
                            {uniqueFloorLevels.sort().map((floorLevel) => (
                              <button
                                key={floorLevel}
                                className={`w-full h-10 bg-bsase-100 btn ${selectedFloor === `${floorLevel}`
                                  ? "bg-base-content text-base-100"
                                  : "hover:bg-base-200"
                                  }`}
                                onClick={() =>
                                  clickFloor(selectedBuilding, floorLevel)
                                }
                              >
                                {floorLevel}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="absolute w-20 h-full px-3 shadow-inner -left-3 bg-base-300 rounded-3xl">
                  <div className="flex flex-col justify-center pt-3">
                    {selectedBuilding && (
                      <>
                        <button
                          onClick={
                            showOverview
                              ? handleFloorsClick
                              : handleOverviewClick
                          }
                          className={` btn   w-full bg-transparent btn-square shadow-none ${!showOverview
                            ? "bg-transparent btn-square shadow-none font-semibold text-base-content"
                            : ""
                            }`}
                        >
                          {showOverview ? (
                            // Render back icon here
                            <Icon
                              icon="icon-park-outline:back"
                              className="w-10 h-10"
                            />
                          ) : (
                            // Render floor icon here
                            <Icon
                              icon="tabler:box-multiple"
                              className={`w-10 h-10`}
                            />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                  {showOverview ? (
                    <>
                      <div className="h-full overflow-y-auto"></div>
                    </>
                  ) : (
                    <div>
                      {selectedBuilding && !showOverview && (
                        <div className="h-full overflow-y-auto">
                          <div className="grid grid-cols-1 gap-2 my-3">
                            {uniqueFloorLevels.sort().map((floorLevel) => (
                              <button
                                key={floorLevel}
                                className={`w-full h-10 bg-bsase-100 btn ${selectedFloor === `${floorLevel}`
                                  ? "bg-base-content text-base-100"
                                  : "hover:bg-base-200"
                                  }`}
                                onClick={() =>
                                  clickFloor(selectedBuilding, floorLevel)
                                }
                              >
                                {floorLevel}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col w-full space-y-3">
                  <div className="flex items-center justify-between w-full  ">
                    {" "}
                    <button
                      onClick={handleOverviewClick}
                      className={` rounded-xl text-3xl p-2 font-bold mx-2 mt-4 h-14 hover:bg-base-300 ${showOverview
                        ? "hover:bg-transparent  text-base-content w-auto mt-4 h-14 mx-4"
                        : ""
                        }`}
                    >
                      {selectedBuilding}
                    </button>
                    <div className="flex">
                      <button
                        onClick={handleBuildingInfoClick}
                        className="mt-5 mr-5 bg-transparent btn btn-square hover:bg-base-content hover:text-white"
                      >
                        <Icon
                          icon="akar-icons:chat-question"
                          className="w-10 h-10"
                        />
                      </button>
                      <button
                        onClick={closeModal}
                        className="mt-5 mr-5 bg-transparent btn btn-square hover:bg-red-400 hover:text-white"
                      >
                        <Icon
                          icon="line-md:close-small"
                          className="w-10 h-10"
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start justify-center w-full h-full ">
                    {!showOverview && (
                      <div className="flex flex-col justify-between h-auto bg-base-200 rounded-3xl">
                        <h1 className="text-2xl font-semibold text-center">
                          Rooms
                        </h1>
                        <div className="w-64 p-3 pb-4 space-y-2 overflow-y-auto h-96 overflow-clip bg-base-300 rounded-2xl">
                          {!selectedFloor && (
                            <div className="flex flex-col items-center justify-center w-full p-6 text-lg text-center text-base-content">
                              <Icon
                                icon="typcn:warning-outline"
                                className="w-10 h-10"
                              />
                              <h1>
                                Please select a desired floor from the sidebar
                                on the left
                              </h1>
                            </div>
                          )}
                          {selectedBuilding &&
                            selectedFloor &&
                            rooms
                              .sort()
                              .filter(
                                (room) =>
                                  room.floorLevel === selectedFloor &&
                                  room.buildingName === selectedBuilding
                              )
                              .map((room) => (
                                <div
                                  key={room.id}
                                  className="flex flex-col mb-4"
                                >
                                  <button
                                    className={`h-10 bg-base-100 btn flex`}
                                    onClick={() => selectRoom(room)}
                                  >
                                    {room.roomCode}
                                  </button>
                                </div>
                              ))}
                        </div>
                      </div>
                    )}
                    {showOverview ? (
                      <div className="w-full h-full duration-150 bg-base-100 rounded-2xl">
                        <div className="flex items-center p-6 pt-0 pl-0">
                          <div className="w-full p-6 shadow-inner bg-base-200 h-96 rounded-2xl">
                            <div className="flex w-full h-full space-x-3 ">
                              <div className="flex flex-col pr-3 space-y-3 overflow-x-auto">
                                {/* Render building information here */}
                                {buildings.map((building, index) => (
                                  <button
                                    key={index}
                                    className={`h-10 z-50 bg-base-100 btn text-sm ${selectedBuilding === building.buildingName
                                      ? "bg-base-content text-base-100"
                                      : "hover:bg-base-200"
                                      }`}
                                    onClick={() =>
                                      handleModelClick(building.buildingName)
                                    }
                                  >
                                    {building.buildingName}
                                  </button>
                                ))}
                              </div>
                              <div className="flex flex-col items-center justify-center w-full h-5 rounded-2xl ">
                                <h1 className="text-3xl font-semibold text-base-content">
                                  Details
                                </h1>
                                {/* Render building data here */}
                                {selectedBuilding && (
                                  <div className="p-6 absolute top-[155px] w-7/12 bg-base-300 space-y-2 h-72 rounded-2xl">
                                    {buildings.map((building) => {
                                      if (
                                        building.buildingName ===
                                        selectedBuilding
                                      ) {
                                        return (
                                          <div key={building.id}>
                                            {/* <p>
                                              Building Name:{" "}
                                              {building.buildingName}
                                            </p> */}
                                            <p className="font-semibold text-2xl">
                                              Building Name: <span className="font-normal text-2xl">{building.buildingName}</span>
                                            </p>
                                            <p className="font-semibold text-2xl">
                                              Status: <span className="font-normal text-2xl">{building.status}</span>
                                            </p>
                                            <p className="font-semibold text-2xl">
                                              Total Floor/s: <span className="font-normal text-2xl">{building.totalFloor}</span>
                                            </p>
                                            {/* Add more building properties here if needed */}
                                          </div>
                                        );
                                      }
                                      return null;
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-auto m-6 mt-0 shadow-inner bg-base-300 rounded-2xl">
                        <div className="flex flex-col items-center p-0">
                          <div className="w-full p-6 shadow-inner bg-base-200 h-[420px] rounded-2xl">
                            <div className="relative flex flex-col w-full h-full space-y-3">
                              <div className="text-base-content">
                                {selectedBuilding &&
                                  selectedFloor &&
                                  selectedRoom && (
                                    <div>
                                      <ul className="space-y-2 text-2xl">
                                        <h1 className="mb-5 -mt-0 text-3xl font-bold text-center">
                                          Details
                                        </h1>
                                        <li>
                                          <b>Name: {selectedRoom.roomName}</b>
                                        </li>
                                        <li>
                                          <b>
                                            Floor: {selectedRoom.floorLevel}
                                          </b>
                                        </li>
                                        <li>
                                          <b>
                                            Distance: {selectedRoom.distance}
                                          </b>
                                        </li>
                                        <li>
                                          <b>ETA: {selectedRoom.eta}</b>
                                        </li>
                                        <li>
                                          <b>
                                            Size: {selectedRoom.squareMeter}
                                          </b>
                                        </li>
                                        <li>
                                          <b>Status: {selectedRoom.status}</b>
                                        </li>
                                      </ul>
                                      <div className="w-full p-3">
                                        <button
                                          className=" btn btn-secondary btn-block"
                                          onClick={() =>
                                            clickAnimation(
                                              selectedRoom.roomCode
                                            )
                                          }
                                        >
                                          Get Direction {selectedRoom.roomCode}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Modal>
          <Modal
            className="flex items-center justify-center w-screen h-screen  bg-black/60"
            isOpen={errorModal}
            onRequestClose={() => setShowModal(false)}
            contentLabel="Alert"
          >
            <div className="h-56 p-6 shadow-xl bg-base-100 rounded-2xl w-96">
              <p className="text-3xl text-center">{modalContent}</p>
              <div className="flex justify-center space-x-3 mt-14">
                <button onClick={closeErrorModal} className="btn bg-base-300">
                  <Icon icon="line-md:close-small" className="w-10 h-10" />
                  Close
                </button>
              </div>
            </div>
          </Modal>

          {/* Modal for General Building Information */}
          <Modal
            className="flex items-center justify-center w-screen h-screen  bg-black/60"
            isOpen={showBuildingInfo}
            onRequestClose={() => setBuildingInfoModal(false)}
            contentLabel="Alert"
          >
            <div className="p-6 shadow-xl h-auto w-6/12 bg-base-100 rounded-2xl text-base-content">
              <div className="flex justify-evenly">
                <div className="">
                  <div className="flex justify-center items-center pb-2">
                    <h1 className="font-bold">Classification of Buildings</h1>
                  </div>
                  <div className="">
                    <div className="flex justify-between px-6 pb-3 bg-base-300 shadow-inner rounded-2xl h-auto">
                      <div className="flex flex-col">
                        <h1 className="text-base font-semibold">
                          Building Name
                        </h1>
                        <div className="">
                          <p>Techvoc Building </p>
                          <p>Yellow Building (Old Academic Building)</p>
                          <p>SB (Belmonte Hall)</p>
                          <p>Admin Building</p>
                          <p>Metalcasting Building</p>
                          <p>KorPhil Building</p>
                          <p>PHilChi Building</p>
                          <p>Chem Lab</p>
                          <p>Canteen</p>
                          <p>Auditorium (Bautista Building)</p>
                          <p>New Academic Building</p>
                        </div>
                      </div>
                      <div>
                        <h1 className="text-base font-semibold">
                          Reference Code
                        </h1>
                        <div className="text-center">
                          <p>IA</p>
                          <p>IB</p>
                          <p>IC</p>
                          <p>ID</p>
                          <p>IE</p>
                          <p>IF</p>
                          <p>IG</p>
                          <p>IH</p>
                          <p>IJ</p>
                          <p>IK</p>
                          <p>IL</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="">
                  <div className="flex justify-center items-center pb-2">
                    <h1 className="font-bold">Classification of Rooms</h1>
                  </div>
                  <div className="">
                    <div className="flex justify-between px-6 pb-3 bg-base-300 shadow-inner rounded-2xl h-auto">
                      <div className="flex flex-col">
                        <h1 className="text-base font-semibold">Room Type</h1>
                        <div className="">
                          <p>Lecture Room</p>
                          <p>Computer Lab Room</p>
                          <p>Working Lab Room</p>
                          <p>Science Lab Room</p>
                        </div>
                      </div>
                      <div>
                        <h1 className="text-base font-semibold">
                          Reference Code
                        </h1>
                        <div className="text-center">
                          <p>a</p>
                          <p>b</p>
                          <p>c</p>
                          <p>d</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-center pt-4 pb-2">
                      Room Allocation as of January 2023
                    </p>
                    <p className="text-center py-3">
                      Building Codes as of January 2023
                    </p>
                    <div className="flex justify-center items-center mt-5">
                      <button
                        onClick={closeBuildingInfoModal}
                        className="btn bg-base-300 text-xl hover:bg-accent btn-block"
                      >
                        <Icon
                          icon="mingcute:check-2-line"
                          className="w-10 h-10"
                        />
                        I, Understand.
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        </>
      )}
    </>
  );
};

export default SanBartolome;
