/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('faqs', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		question: {
			type: DataTypes.STRING(255),
			allowNull: false
		},
		answer: {
			type: DataTypes.TEXT,
			allowNull: true,

		},
		isClicked: {
			type: DataTypes.BOOLEAN,
			 allowNull: false, 
			 defaultValue: true
		},

		createdAt: {
			field: "created_at",
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		updatedAt: {
			field: "updated_at",

			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		}
	}, {
		tableName: 'faqs'
	});
};
