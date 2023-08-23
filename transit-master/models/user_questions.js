/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('user_questions', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		user_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0

		},
		trnsporter_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0
		},
		booking_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0

		},
		questions: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:0

		},
		createdAt: {
			field:"created_at",
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		updatedAt: {
			field:"updated_at",
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		status: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0'
		}
	}, {
		tableName: 'user_questions'
	});
};
