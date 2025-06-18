// const express = require('express');
// const router = express.Router();
// const {getAllEngineers,addEngineer} = require('../../controllers/adminControllers/adminEngineerController');

// router.get('/engineers', getAllEngineers);
// router.post('/engineer', addEngineer);

// module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getAllEngineers,
  addEngineer,
  getEngineerById // ✅ Import the new controller function
} = require('../../controllers/adminControllers/adminEngineerController');

// 📌 Routes
router.get('/engineers', getAllEngineers);            // Get all engineers
router.post('/engineer', addEngineer);                // Add a new engineer
router.get('/engineers/:id', getEngineerById);        // ✅ Get engineer by ID (for detailed view)

module.exports = router;
