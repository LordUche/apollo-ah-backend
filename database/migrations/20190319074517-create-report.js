export default {
  up: (queryInterface, Sequelize) => queryInterface.createTable('reports', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    articleId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Articles',
        key: 'id'
      },
    },
    reportType: {
      type: Sequelize.ENUM,
      values: ['spam', 'plagiarism', 'rules violation', 'others'],
      allowNull: false,
    },
    comment: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('reports')
};
