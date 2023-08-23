/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('ratings', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		user_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		car_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue:0
		},
		transporter_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		comment: {
			type: DataTypes.STRING(255),
			allowNull: false
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
		ratings: {
			type: DataTypes.FLOAT,
			allowNull: false
		}
	}, {
		tableName: 'ratings'
	});
};
