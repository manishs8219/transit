/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('payments', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		car_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0
		},
		user_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		card_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0

		},
		transporter_fee: {
			type: DataTypes.DOUBLE,
			allowNull: true,
		},
		transporter_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
	
		item_code:{
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""


		},
	    is_payment :{
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:1

		},
		bank_id :{
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0	
		

		},
		withdraw_status :{
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0	

		},
		transporter_amount:{
			type: DataTypes.DOUBLE,
			allowNull: true,

		},
		type :{
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0
		},
		admin_commission:{
			type: DataTypes.DOUBLE,
			allowNull: true,

		},
		createdAt: {
			field:"created_at",
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		updatedAt: {
			field:"updated_at",
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		}
	}, {
		tableName: 'payments'
	});
};
