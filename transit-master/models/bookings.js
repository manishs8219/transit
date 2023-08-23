/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('bookings', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		type: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0

		},
		preference_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0
		},

		userid: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		transporterid: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0
		},
		
		category_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue:0
		},
		from_name: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		from_street_adress: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		from_postcode: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		from_city: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		from_country_code: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		from_number: {
			type: DataTypes.BIGINT,
			allowNull: true
		},
		from_lat: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		from_log: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		delivery_time: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
	
		to_name: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		to_street_adress: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		to_postcode: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		to_city: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		to_number: {
			type: DataTypes.BIGINT,
			allowNull: true
		},
		to_country_code: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		to_lat: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		to_log: {
			type: DataTypes.STRING(255),
			allowNull: true
		},
		people_moved: {
			field:"people_moved",
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
	     start_date: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '',
			field: 'start_date'
		},
        end_date: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue:'',
			field: 'end_date'
		},	
	
		
	}, {
		tableName: 'bookings'
	});
};
