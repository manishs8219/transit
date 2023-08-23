/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('offers_from_transporter', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		userid: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0
		},
		booking_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0

		},
		category_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0
		},
		preference_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0

		},
	   car_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0

		},
		transporter_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0

		},
		booking_price	: {
			field:"booking_price",
			type: DataTypes.DOUBLE,
			allowNull: true
		},
		admin_fee: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0
		},
		comment: {
			type: DataTypes.STRING(255),
			allowNull: true
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
		status_offer: {
			type: DataTypes.INTEGER(4),
			allowNull: true,
			defaultValue: '0'
		},
		wid_status:{
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: 0
		}
	}, {
		tableName: 'offers_from_transporter'
	});
};
