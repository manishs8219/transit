/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('car_details', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
	
		transporter_id:{
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0
    	},
		type:{
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0
    	},
		preference_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
         	defaultValue:0
     	},
		category_id:{
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0

		},
		status:{
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0


		},
		booking_price:{
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:0


		},
		comment:{
			type: DataTypes.STRING(255),
			allowNull: true,
		
     	},
		booking_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
	    user_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0
		},
		car_name: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""
		},
		car_model: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""

		},
		car_weight: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""

		},
		furniture_height: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""

		},
		furniture_width: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""

		},
		furniture_weight: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""

		},
		tittle: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""

		},
		height: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""

		},
		width: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""

		},
		weight: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""

		},
		optional_detail: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""

		},
		bike_name: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""

		},
		bike_model: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""

		},
		bike_weight: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""

		},

		other_category: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:""
		},
		start_end_bookings :{
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0

		},
		start_date :{
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0

		},
		end_date :{
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0

		},
		from_lat: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:0
		},
		from_log: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:0


		},
		to_lat: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:0
		},
		to_log: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:0
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
		tableName: 'car_details'
	});
};
