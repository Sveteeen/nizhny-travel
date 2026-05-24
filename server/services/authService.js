const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Role } = require('../db/models');

const USER_ROLE_ID = 2;

const register = async ({ email, password, username, name, phone }) => {
  const isUserInBd = await User.findOne({
    where: { email: email.trim().toLowerCase() },
  });

  if (isUserInBd) {
    return { error: 'Пользователь с такой почтой уже зарегистрирован.' };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    email: email.trim().toLowerCase(),
    password: passwordHash,
    role_id: USER_ROLE_ID,
    username: username?.trim().toLowerCase() || null,
    name: name?.trim() || null,
    phone: phone?.trim() || null,
  });

  const plainUser = user.get({ plain: true });
  delete plainUser.password;

  const token = jwt.sign(
    { userId: plainUser.id, roleId: plainUser.role_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '3d'},
  );

  return { user: plainUser, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    return { error: 'Пользователь с такой почтой не зарегистрирован.' };
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    return { error: 'Неправильные пароль или почта.' };
  }

  const plainUser = user.get 
    ? user.get({ plain: true })
    : user;

  delete plainUser.password;  

  const token = jwt.sign(
    { userId: user.id,  roleId: user.role_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '3d' },
  );

  return { user: plainUser, token };
}

const getUserById = async (userId) => {
  const user = await User.findOne({
    where: { id: userId },
    attributes: { exclude: ['password' ] },
    include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
  });
  return user;
}

const updateUser = async (userId, data) => {
  const user = await User.findOne({
    where: { id: userId },
  });

  if (!user) {
    return { error: 'Пользователь не найден.', statusCode: 404 };
  }

  const save = {
    phone: data.phone || user.phone,
    name: data.name || user.name,
  };

  if (data.password) {
    save.password = await bcrypt.hash(data.password, 10);
  }

  if (data.email) {
    const isUser = await User.findOne({
      where: { 
        email: data.email.trim().toLowerCase(),
        id: { [Op.ne]: userId },
      }
    });

    if (isUser) {
      return { error: 'Пользователь с такой почтой уже зарегистрирован.', statusCode: 409 };
    }
    save.email = data.email.trim().toLowerCase();
  }

  if (data.username) {
    const isUser = await User.findOne({
      where: { 
        username: data.username.trim().toLowerCase(),
        id: { [Op.ne]: userId },
      }
    });

    if (isUser) {
      return { error: 'Пользователь с таким именем уже зарегистрирован.', statusCode: 409 };
    }
    save.username = data.username.trim().toLowerCase();
  }

  await user.update(save);
  
  const updUser = await getUserById(userId);
  return updUser;
};

module.exports = { login, register, getUserById, updateUser};

