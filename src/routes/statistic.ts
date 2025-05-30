// external import
import express from "express";

// internal import
import statsController from "../controller/statistic";

// router
const router = express.Router();

// routes
router.get("/dept/student", statsController.getStudentStatsByDept);

router.get("/dept/teacher", statsController.getTeacherStatsByDept);

router.get("/stuff", statsController.getStuffStats);

router.get("/revenue", statsController.getRevenue);

router.get("/revenues-range", statsController.getRevenuesLastFiveYear);

router.get("/growth", statsController.getGrowth);

router.get("/placement", statsController.getPlacementStats);

router.get("/satisfy/student", statsController.getSatisfyStatsByStudent);

router.get("/rate/graduate", statsController.getGraduateRateStats);

router.get("/rate/satisfy", statsController.getSatisfyRateStats);

// export
export default router;
