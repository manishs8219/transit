/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('carring_images', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		type: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		preference_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0
		},
		car_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		category_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue:0
		},
		booking_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},

		user_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false
		},
		images: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""
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
		}
	}, {
		tableName: 'carring_images'
	});
};
