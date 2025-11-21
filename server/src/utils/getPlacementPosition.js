const UserModel = require("../models/user.Model")

 const getPlacementPosition = async (sponsorId) => {
  let queue = [sponsorId];

  while (queue.length > 0) {
    const currentUserId = queue.shift();
    const user = await UserModel.findById(currentUserId).select("left right");

    if (!user) continue;

    // Priority: Left first
    if (!user.left) return { parentId: user._id, position: "left" };
    // Then right
    if (!user.right) return { parentId: user._id, position: "right" };

    queue.push(user.left);
    queue.push(user.right);
  }
  return null;
};



module.exports = { getPlacementPosition };
