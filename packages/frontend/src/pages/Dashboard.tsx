import React from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import '../styles/react-grid.css';
import { useParams } from 'react-router-dom';
import { DashboardChartTile, DashboardTileTypes } from 'common';
import styled from 'styled-components';
import {
    useDashboardQuery,
    useUpdateDashboard,
} from '../hooks/dashboard/useDashboard';
import ChartTile from '../components/DashboardTiles/DashboardChartTile';
import AddTileButton from '../components/DashboardTiles/AddTile/AddTileButton';

const WrapperAddTileButton = styled.div`
    display: flex;
    width: 100%;
    justify-content: center;
`;

const Dashboard = () => {
    const { dashboardUuid } = useParams<{ dashboardUuid: string }>();
    const { data: dashboard } = useDashboardQuery(dashboardUuid);
    const { mutate } = useUpdateDashboard(dashboardUuid);

    const updateTiles = (layout: Layout[]) => {
        const tiles = layout.map((tile) => ({
            x: tile.x,
            y: tile.y,
            h: tile.h,
            w: tile.w,
            type: DashboardTileTypes.SAVED_CHART,
            properties: {
                savedChartUuid: tile.i,
            },
        }));
        mutate({ tiles });
    };

    return (
        <>
            <WrapperAddTileButton>
                {dashboard && <AddTileButton dashboard={dashboard} />}
            </WrapperAddTileButton>
            <GridLayout
                width={1000}
                draggableCancel=".non-draggable"
                onDragStop={(layout) => updateTiles(layout)}
                onResizeStop={(layout) => updateTiles(layout)}
            >
                {dashboard &&
                    dashboard.tiles &&
                    dashboard.tiles.map((tile: DashboardChartTile) => {
                        const {
                            x,
                            y,
                            h,
                            w,
                            properties: { savedChartUuid },
                        } = tile;
                        return (
                            <div
                                key={savedChartUuid}
                                data-grid={{ x, y, w, h }}
                            >
                                <ChartTile
                                    tile={tile}
                                    onDelete={() =>
                                        mutate({
                                            tiles: dashboard.tiles.filter(
                                                (filteredTile) =>
                                                    savedChartUuid !==
                                                    filteredTile.properties
                                                        .savedChartUuid,
                                            ),
                                        })
                                    }
                                />
                            </div>
                        );
                    })}
            </GridLayout>
        </>
    );
};
export default Dashboard;