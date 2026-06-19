import { Router } from "express";
import{getproject,
    getprojectbyId,
    createProject,
    UpdateProject,
    deleteProject,
    addmembertoproject,
    getprojectmembers,
    updatememberinproject,
    removememberfromproject} from "../controllers/project.controller.js"
import { validate}  from "../middlewares/validator.mid.js";
import { userChangecurrPass, userforgotPassvali, userLoginValidator, userRegisterValidator, userresetforgotPassvali } from "../validators/index.js";
import { verifyjwt,validateProjectPermission } from "../middlewares/auth.mid.js";
import{createProjectValidator,addmembertoprojectvali} from "../validators/index.js"
import { UserRolesEnum , AvailiableUserRoles} from "../utils/constant.js";

const router= Router();

router.use(verifyjwt)

router.route("/").get(getproject).post(createProjectValidator(),validate,createProject);

router.route("/:projectId").get(validateProjectPermission(AvailiableUserRoles),getprojectbyId)
.put(validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.MEMBER]),validate,UpdateProject)
.delete(validateProjectPermission([UserRolesEnum.ADMIN]),validate,deleteProject);


router.route("/:projectId/members").get(validateProjectPermission(AvailiableUserRoles),getprojectmembers)
.post(validateProjectPermission([UserRolesEnum.ADMIN]),addmembertoprojectvali(),validate,addmembertoproject);


router.route("/:projectId/members/:userId").put(validateProjectPermission([UserRolesEnum.ADMIN]),validate,updatememberinproject)
.delete(validateProjectPermission([UserRolesEnum.ADMIN]),validate,deleteProject);



export default router;