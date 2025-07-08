import Router from "express";
import { getAllContacts, getContactsForDMList, searchedContacts } from "../controllers/ContactsController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const contactsRoutes = Router();

contactsRoutes.post("/search" ,verifyToken , searchedContacts);
contactsRoutes.get("/getAllContactsForDM" , verifyToken , getContactsForDMList);
contactsRoutes.get("/getAllContacts",verifyToken , getAllContacts)

export default contactsRoutes