import UserModel from "../model/user.model.js";
import { sanitizeUserData } from "../utils/security.js";

export default class ProfileController {

    static async getOwnProfile(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ msg: 'Authentication required.' });
            }

            const user = await UserModel.getUserById(userId);
            if (!user) {
                return res.status(404).json({ msg: 'User not found.' });
            }

            res.status(200).json({ user: sanitizeUserData(user) });

        } catch (error) {
            console.error('getOwnProfile error: ', error);
            res.status(500).json({ msg: 'Server error while retrieving profile.' });
        }
    }

    static async updateOwnProfile(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ msg: 'Authentication required.' });
            }

            const profileData = req.body;
            const updatedUser = await UserModel.updateProfile(userId, profileData);

            if (!updatedUser) {
                return res.status(404).json({ msg: 'User not found or failed to update.' });
            }

            res.status(200).json({ 
                msg: 'Profile updated successfully.', 
                user: sanitizeUserData(updatedUser) 
            });

        } catch (error) {
            console.error('updateOwnProfile error: ', error);
            res.status(500).json({ msg: 'Server error while updating profile.' });
        }
    }
}