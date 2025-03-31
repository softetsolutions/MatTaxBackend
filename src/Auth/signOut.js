import userRepositery from "../repositery/userRepositery.js";

class logOut{
    logout = async (req, res) => {
        try {
           const token =
           req.header("Authorization") || req.headers.cookie?.replace("authToken=", "");
           console.log("t",token);
            userRepositery.updateUserByToken(token, { token: null });
            res.clearCookie("authToken", {
                httpOnly: true,
                secure: true,
                sameSite: "Strict",
              });
             return res.status(200).json({ message: "Logout successful" });
        } catch (err) {
          return res.status(400).json(err);
        }
      };
}

export default new logOut();