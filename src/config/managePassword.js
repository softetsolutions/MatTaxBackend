import bcrypt from 'bcrypt';

export class EctDct {

  encrypt = (password) =>
    bcrypt.hashSync(
      password,
      bcrypt.genSaltSync(parseInt(process.env.SaltRound))
    );

  decrypt = async (password, userPassword) =>
    await bcrypt.compare(password, userPassword);
}

export default new EctDct();