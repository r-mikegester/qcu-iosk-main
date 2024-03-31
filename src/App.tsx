/*Imported Dependencies */
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";

/* Map*/
import SanBartolome from "./components/campus/sanBartolome/SanBartolome";
import SanFransisco from "./components/campus/sanFrancisco/SanFransisco";
import Batasan from "./components/campus/batasan/Batasan";

/** Error Catching */

/* Main Routing */

import Map from "../src/pages/maps";
import Home from "./pages/layout";
import SearchTab from "./pages/Search";
import Layout from "../src/pages/layout";

/** Admin Routing */
import Login from "./components/sidebar/auth/unlogin";
import Signup from "./components/sidebar/auth/signup";
import Dashboard from "./components/admin/dashboard";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";
import "./assets/css/index.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/typography.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/padding.css";
/* Theme variables */
import "./assets/css/variables.css";
/*Ionic Components*/

import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import ManageAnnouncements from "./components/admin/management/manageAnnoucements";
import RoomManagement from "./components/admin/management/manageRooms";
import CreateRoom from "../src/components/admin/management/roomComponent/createRoom";
import UpdateRoom from "./components/admin/management/roomComponent/updateRoom";
import BuildingManagement from "./components/admin/management/manageBuilding";
import CreateBuilding from "../src/components/admin/management/buildingComponent/createBuilding";
import UpdateBuilding from "../src/components/admin/management/buildingComponent/updateBuilding";
import AdminSettings from "./components/admin/management/adminSettings";
import EventManagement from "./components/admin/management/manageEvents";
import CreateEvent from "./components/admin/management/eventsComponent/createEvent";
import UpdateEvent from "./components/admin/management/eventsComponent/updateEvent";
import CreateAnnouncement from "./components/admin/management/announcementsComponent/createAnnoncement";
import UpdateAnnouncement from "./components/admin/management/announcementsComponent/updateAnnouncement";
import Archive from "./components/admin/management/manageArchive";
import ManageManual from "./components/admin/management/manualInlineKioskEditor";
import CreateManual from "./components/admin/management/mikeComponent/createManual";
import UpdateManual from "./components/admin/management/mikeComponent/updateManual";
import { Suspense } from "react";
import Loading from "../src/pages/loading";
import SBMapScene from "./components/admin/management/manageSBMap";
import Create3DModel from "../src/components/admin/management/3DMapComponent/create3DModel";
import Update3DModel from "./components/admin/management/3DMapComponent/update3DMode";

setupIonicReact();
interface ContainerProps {
  name: string;
}

declare global {
  interface Window {
    my_modal_2: {
      showModal: () => void;
    };
    select_room: {
      showModal: () => void;
    };
    select_floor: {
      showModal: () => void;
    };
  }
}

const App: React.FC<ContainerProps> = ({ name }) => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/">
          <Redirect to="/Home" />
        </Route>

        {/* <Route path="/Home">
          <Home name={"Home"} />
        </Route> */}

        <Route exact path="/Map">
          <Map name={"Map"} />
        </Route>

        <Route exact path="/SanBartolome">
          <Layout name={"Layout"} buildingName={""} />
        </Route>

        <Route exact path="/SanFransisco">
          <SanFransisco name={"SanFransisco"} />
        </Route>

        <Route exact path="/Batasan">
          <Batasan name={"Batasan"} />
        </Route>

        <Route exact path="/Search">
          <SearchTab />
        </Route>

        <Route exact path="/Login">
          <Login name={"Login"} />
        </Route>

        <Route exact path="/Signup">
          <Signup name={"Signup"} />
        </Route>

        {/* ADMIN ROUTES */}

        <Route exact path="/Dashboard">
          <Dashboard name={"Dashboard"} />
        </Route>

        <Route exact path="/Announcements">
          <ManageAnnouncements name={"Annoucements"} />
        </Route>

        <Route exact path="/Rooms">
          <RoomManagement name={"Room Management"} />
        </Route>

        <Route exact path="/createRoom">
          <CreateRoom name={"Create Room"} />
        </Route>

        <Route path="/updateRoom/:roomId">
          <UpdateRoom name="Update Room" />
        </Route>

        <Route exact path="/Building">
          <BuildingManagement name={"Building Management"} />
        </Route>

        <Route exact path="/createBuilding">
          <CreateBuilding name={"Create Building"} />
        </Route>

        <Route exact path="/updateBuilding/:buildingId">
          <UpdateBuilding name={"Update Building"} />
        </Route>

        <Route exact path="/SBMap">
          <SBMapScene name={"SB Map Management"} />
        </Route>

        <Route exact path="/create3DModel">
          <Create3DModel name={"Create 3d Model"} />
        </Route>

        <Route exact path="/update3DModel/:modelId">
          <Update3DModel name={"Update 3d Model"} />
        </Route>

        <Route exact path="/Settings">
          <AdminSettings name={"Settings"} />
        </Route>

        <Route exact path="/Events">
          <EventManagement name={"Event Management"} />
        </Route>

        <Route exact path="/createEvent">
          <CreateEvent name={"Create Events"} />
        </Route>

        <Route exact path="/updateEvent/:eventId">
          <UpdateEvent name={"Update Events"} />
        </Route>

        <Route exact path="/createAnnouncement">
          <CreateAnnouncement name={"Create Announcements"} />
        </Route>

        <Route exact path="/updateAnnouncement/:announcementId">
          <UpdateAnnouncement name={"Update Announcements"} />
        </Route>

        <Route exact path="/Archive">
          <Archive name={"Archive"} />
        </Route>

        <Route exact path="/Mike">
          <ManageManual name={"Mike"} />
        </Route>

        <Route exact path="/createManual">
          <CreateManual name={"Create Manual"} />
        </Route>

        <Route exact path="/updateManual/:manualId">
          <UpdateManual name={"Update Manual"} />
        </Route>

        {/* sheeesh */}
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
